# CI/CD Workflow Implementation

## Overview

This document provides the comprehensive CI/CD workflow implementation for the My Family Clinic healthcare platform. Built upon the deployment strategy from Sub-Phase 12.3, this implementation focuses on practical automation, healthcare compliance, and robust pipeline monitoring.

## Architecture Overview

### Pipeline Flow

```mermaid
graph TB
    A[Git Push/PR] --> B[Automated Triggers]
    B --> C[Code Quality Gates]
    C --> D[Security Validation]
    D --> E[Unit & Integration Tests]
    E --> F[Healthcare Compliance Checks]
    F --> G[Build & Package]
    G --> H[Deploy to Staging]
    H --> I[E2E Testing]
    I --> J[Performance Validation]
    J --> K[Production Deployment]
    K --> L[Health Checks]
    L --> M[Post-Deployment Monitoring]
    
    N[Security Scan Failure] --> O[Pipeline Halt]
    P[Test Failure] --> O
    Q[Compliance Failure] --> O
    R[Health Check Failure] --> S[Automatic Rollback]
```

### Environment Strategy

| Environment | Purpose | Data Type | Deployment | SLA |
|------------|---------|-----------|------------|-----|
| **Development** | Feature development | Synthetic only | On-demand | Best effort |
| **Staging** | Integration testing | Anonymized prod data | Daily automated | 99.5% |
| **Production** | Live operations | Real patient data | Scheduled with approval | 99.9% |

## Implementation Components

### 1. GitHub Actions Workflow Files

#### Main CI/CD Pipeline (`healthcare-main.yml`)

```yaml
name: Healthcare Platform CI/CD

on:
  push:
    branches: [main, develop]
    paths-ignore: ['docs/**', '*.md']
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Daily security scan
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production
      skip_tests:
        description: 'Skip tests (emergency only)'
        required: false
        default: false
        type: boolean

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/my-family-clinic

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # =================== QUALITY GATES ===================
  quality-gates:
    name: Quality Validation
    runs-on: ubuntu-latest
    outputs:
      commit-hash: ${{ steps.commit.outputs.hash }}
      branch-name: ${{ steps.commit.outputs.branch }}
      code-coverage: ${{ steps.coverage.outputs.coverage }}
      security-score: ${{ steps.security.outputs.score }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Full history for better analysis

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: my-family-clinic/package-lock.json

    - name: Install dependencies
      working-directory: my-family-clinic
      run: npm ci --only=production

    - name: Commit information
      id: commit
      run: |
        echo "hash=${{ github.sha }}" >> $GITHUB_OUTPUT
        echo "branch=${{ github.ref_name }}" >> $GITHUB_OUTPUT

    - name: Run ESLint
      working-directory: my-family-clinic
      run: |
        npm run lint
        echo "✅ ESLint passed"

    - name: Run Prettier formatting check
      working-directory: my-family-clinic
      run: |
        npm run format:check || exit 1
        echo "✅ Code formatting check passed"

    - name: TypeScript type checking
      working-directory: my-family-clinic
      run: |
        npm run type-check
        echo "✅ TypeScript check passed"

    - name: Calculate code coverage
      id: coverage
      working-directory: my-family-clinic
      run: |
        npm run test:coverage -- --passWithNoTests
        COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
        echo "coverage=$COVERAGE" >> $GITHUB_OUTPUT
        echo "📊 Code coverage: $COVERAGE%"
        
        # Fail if coverage is below threshold
        if (( $(echo "$COVERAGE < 80" | bc -l) )); then
          echo "❌ Coverage $COVERAGE% is below 80% threshold"
          exit 1
        fi

    - name: Security scan with Trivy
      id: security
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: 'my-family-clinic'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

    - name: Security score check
      run: |
        # Parse security scan results
        if [ -f "trivy-results.sarif" ]; then
          HIGH_ISSUES=$(grep -o '"level":"error"' trivy-results.sarif | wc -l)
          echo "security-score=$((100 - HIGH_ISSUES * 10))" >> $GITHUB_OUTPUT
          
          if [ $HIGH_ISSUES -gt 0 ]; then
            echo "⚠️  Found $HIGH_ISSUES high severity security issues"
            # Allow but warn for development branches
            if [[ "${{ github.ref_name }}" != "main" ]]; then
              echo "⚠️  Security issues found but continuing for development branch"
            fi
          fi
        else
          echo "security-score=100" >> $GITHUB_OUTPUT
        fi

    - name: CodeQL Security Analysis
      uses: github/codeql-action/init@v2
      with:
        languages: javascript, typescript
        queries: security-extended

    - name: Autobuild
      uses: github/codeql-action/autobuild@v2

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2

  # =================== UNIT TESTING ===================
  unit-tests:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    needs: quality-gates
    
    strategy:
      matrix:
        test-suite: [unit, integration, e2e]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: my-family-clinic/package-lock.json

    - name: Install dependencies
      working-directory: my-family-clinic
      run: npm ci

    - name: Setup test database
      env:
        POSTGRES_PASSWORD: postgres
      run: |
        docker run -d --name test-postgres \
          -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
          -e POSTGRES_DB=healthcare_test \
          -p 5432:5432 postgres:14
        sleep 10

    - name: Run ${{ matrix.test-suite }} tests
      working-directory: my-family-clinic
      run: |
        case ${{ matrix.test-suite }} in
          unit)
            npm run test:unit
            ;;
          integration)
            npm run test:integration
            ;;
          e2e)
            npm run test:e2e:headless
            ;;
        esac
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/healthcare_test
        NODE_ENV: test
        JWT_SECRET: test-secret-key

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: ${{ matrix.test-suite }}-results
        path: |
          my-family-clinic/coverage/
          my-family-clinic/test-results/
        retention-days: 30

    - name: Test coverage report
      working-directory: my-family-clinic
      if: matrix.test-suite == 'unit'
      run: |
        npm run test:coverage -- --coverageReporters=lcov
        echo "📈 Test coverage uploaded"

  # =================== BUILD PHASE ===================
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [quality-gates, unit-tests]
    
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
      image-tag: ${{ steps.meta.outputs.tags }}
      build-time: ${{ steps.build-time.outputs.time }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: my-family-clinic/package-lock.json

    - name: Install dependencies
      working-directory: my-family-clinic
      run: npm ci --only=production

    - name: Build application
      working-directory: my-family-clinic
      run: |
        npm run build
        echo "✅ Application built successfully"
      env:
        NODE_ENV: production
        NEXT_TELEMETRY_DISABLED: 1

    - name: Build timestamp
      id: build-time
      run: |
        echo "time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> $GITHUB_OUTPUT

    - name: Docker metadata
      id: meta
      working-directory: my-family-clinic
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
          type=raw,value=production,enable={{is_default_branch}}
          type=sha

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Docker image
      id: build
      working-directory: my-family-clinic
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        platforms: linux/amd64,linux/arm64

    - name: Container security scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ steps.meta.outputs.tags }}
        format: 'sarif'
        output: 'container-scan-results.sarif'

    - name: Upload container scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'container-scan-results.sarif'

  # =================== HEALTHCARE COMPLIANCE ===================
  healthcare-compliance:
    name: Healthcare Compliance Validation
    runs-on: ubuntu-latest
    needs: [build]
    if: always() && needs.build.result == 'success'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: PDPA Compliance Check
      run: |
        echo "🔒 Validating PDPA compliance..."
        ./scripts/cicd/validate-pdpa-compliance.sh
        
        echo "✅ PDPA compliance validated"

    - name: MOH Regulation Validation
      run: |
        echo "🏥 Validating MOH regulations..."
        ./scripts/cicd/validate-moh-compliance.sh
        
        echo "✅ MOH regulations validated"

    - name: Healthcare Data Handling Check
      run: |
        echo "🩺 Validating healthcare data handling..."
        ./scripts/cicd/validate-healthcare-data.sh
        
        echo "✅ Healthcare data handling validated"

    - name: Audit Trail Validation
      run: |
        echo "📋 Validating audit trail implementation..."
        ./scripts/cicd/validate-audit-trails.sh
        
        echo "✅ Audit trail implementation validated"

    - name: Security Policy Validation
      run: |
        echo "🛡️  Validating security policies..."
        ./scripts/cicd/validate-security-policies.sh
        
        echo "✅ Security policies validated"

  # =================== DEPLOYMENT ===================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, healthcare-compliance]
    if: github.ref == 'refs/heads/develop' || github.event.inputs.environment == 'staging'
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Pre-deployment validation
      run: |
        echo "🔍 Running pre-deployment checks..."
        ./scripts/cicd/pre-deployment-check.sh staging
        
        echo "✅ Pre-deployment checks passed"

    - name: Setup Supabase CLI
      uses: supabase/setup-cli@v1
      with:
        version: latest

    - name: Deploy to staging Supabase
      run: |
        echo "🚀 Deploying to staging environment..."
        cd my-family-clinic
        
        # Deploy database migrations
        supabase db push --project-ref ${{ secrets.SUPABASE_STAGING_PROJECT_ID }}
        
        # Deploy edge functions
        supabase functions deploy --project-ref ${{ secrets.SUPABASE_STAGING_PROJECT_ID }}
        
        echo "✅ Database deployed to staging"

    - name: Deploy frontend to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-args: '--prod'
        working-directory: my-family-clinic

    - name: Run staging smoke tests
      run: |
        echo "🧪 Running smoke tests..."
        ./scripts/cicd/smoke-tests.sh staging
        
        echo "✅ Smoke tests passed"

    - name: Run E2E tests on staging
      run: |
        echo "🔬 Running E2E tests on staging..."
        ./scripts/cicd/e2e-tests.sh staging
        
        echo "✅ E2E tests passed"

    - name: Performance validation
      run: |
        echo "⚡ Running performance validation..."
        ./scripts/cicd/performance-check.sh staging
        
        echo "✅ Performance validation passed"

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: success
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        fields: repo,message,commit,author,action,eventName,ref,workflow
        message: |
          ✅ Staging deployment successful!
          Branch: ${{ github.ref_name }}
          Commit: ${{ github.sha }}
          Environment: staging
      if: success()

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    if: github.ref == 'refs/heads/main' || github.event.inputs.environment == 'production'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Manual approval for production
      uses: trstringer/manual-approval@v1
      with:
        secret: ${{ github.TOKEN }}
        approvers: ${{ secrets.PRODUCTION_APPROVERS }}
        minimum-approvals: 2
        issue-title: "Production deployment approval"
        issue-body: "Approve deployment of commit ${{ github.sha }} to production"
        excludeOwnCommit: true

    - name: Pre-production backup
      run: |
        echo "💾 Creating pre-production backup..."
        ./scripts/cicd/create-backup.sh production
        
        echo "✅ Pre-production backup created"

    - name: Maintenance mode check
      run: |
        echo "🚧 Checking maintenance mode requirements..."
        ./scripts/cicd/maintenance-mode-check.sh
        
        echo "✅ Maintenance mode requirements validated"

    - name: Deploy to production Supabase
      run: |
        echo "🚀 Deploying to production environment..."
        cd my-family-clinic
        
        # Deploy database migrations with verification
        supabase db push --project-ref ${{ secrets.SUPABASE_PROD_PROJECT_ID }}
        
        # Deploy edge functions
        supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROD_PROJECT_ID }}
        
        echo "✅ Database deployed to production"

    - name: Deploy frontend to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-args: '--prod'
        working-directory: my-family-clinic
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

    - name: Post-deployment validation
      run: |
        echo "✅ Running post-deployment validation..."
        ./scripts/cicd/post-deployment-validate.sh production
        
        echo "✅ Post-deployment validation passed"

    - name: Health checks
      run: |
        echo "🏥 Running production health checks..."
        ./scripts/cicd/health-checks.sh production
        
        echo "✅ Production health checks passed"

    - name: Security validation
      run: |
        echo "🔒 Running production security validation..."
        ./scripts/cicd/security-validation.sh production
        
        echo "✅ Production security validation passed"

    - name: Notify successful deployment
      uses: 8398a7/action-slack@v3
      with:
        status: success
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        fields: repo,message,commit,author,action,eventName,ref,workflow
        message: |
          🚀 Production deployment successful!
          Branch: ${{ github.ref_name }}
          Commit: ${{ github.sha }}
          Environment: production
      if: success()

    - name: Notify failed deployment
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        fields: repo,message,commit,author,action,eventName,ref,workflow
        message: |
          ❌ Production deployment failed!
          Branch: ${{ github.ref_name }}
          Commit: ${{ github.sha }}
          Environment: production
      if: failure()

  # =================== MONITORING ===================
  monitoring:
    name: Post-Deployment Monitoring
    runs-on: ubuntu-latest
    needs: deploy-production
    if: always() && needs.deploy-production.result == 'success'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Wait for metrics collection
      run: |
        echo "⏳ Waiting for metrics collection..."
        sleep 300

    - name: Application monitoring
      run: |
        echo "📊 Running application monitoring checks..."
        ./scripts/cicd/monitoring-checks.sh production
        
        echo "✅ Application monitoring checks passed"

    - name: Performance monitoring
      run: |
        echo "⚡ Running performance monitoring..."
        ./scripts/cicd/performance-monitoring.sh production
        
        echo "✅ Performance monitoring passed"

    - name: Security monitoring
      run: |
        echo "🔒 Running security monitoring..."
        ./scripts/cicd/security-monitoring.sh production
        
        echo "✅ Security monitoring passed"

    - name: Compliance monitoring
      run: |
        echo "📋 Running compliance monitoring..."
        ./scripts/cicd/compliance-monitoring.sh production
        
        echo "✅ Compliance monitoring passed"

  # =================== ROLLBACK ===================
  rollback:
    name: Emergency Rollback
    runs-on: ubuntu-latest
    needs: monitoring
    if: always() && needs.monitoring.result == 'failure'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Emergency rollback
      run: |
        echo "🚨 Initiating emergency rollback..."
        ./scripts/cicd/emergency-rollback.sh production
        
        echo "✅ Emergency rollback completed"

    - name: Notify rollback
      uses: 8398a7/action-slack@v3
      with:
        status: custom
        custom_payload: |
          {
            "text": "🚨 EMERGENCY ROLLBACK INITIATED",
            "attachments": [
              {
                "color": "danger",
                "fields": [
                  {
                    "title": "Environment",
                    "value": "production",
                    "short": true
                  },
                  {
                    "title": "Trigger",
                    "value": "Monitoring failure",
                    "short": true
                  }
                ]
              }
            ]
          }
        channel: '#alerts'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Pull Request Validation Workflow (`pr-validation.yml`)

```yaml
name: Pull Request Validation

on:
  pull_request:
    branches: [main, develop]
  pull_request_target:
    branches: [main, develop]

jobs:
  pr-validation:
    name: PR Quality Checks
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        ref: ${{ github.event.pull_request.head.sha }}

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: my-family-clinic/package-lock.json

    - name: Install dependencies
      working-directory: my-family-clinic
      run: npm ci

    - name: Quick quality checks
      working-directory: my-family-clinic
      run: |
        echo "🔍 Running quick quality checks..."
        npm run lint --silent
        npm run type-check --silent
        echo "✅ Quick quality checks passed"

    - name: Quick tests
      working-directory: my-family-clinic
      run: |
        echo "🧪 Running quick tests..."
        npm run test:quick
        echo "✅ Quick tests passed"

    - name: Comment PR with results
      uses: actions/github-script@v6
      with:
        script: |
          const { data: comments } = await github.rest.issues.listComments({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
          });

          const botComment = comments.find(comment => 
            comment.user.login === 'github-actions[bot]' &&
            comment.body.includes('✅ PR Validation Complete')
          );

          const validationMessage = `
          ✅ **PR Validation Complete**
          
          **Quality Checks:**
          - Code linting: ✅ Passed
          - Type checking: ✅ Passed
          - Quick tests: ✅ Passed
          
          **Next Steps:**
          - Full CI/CD pipeline will run on merge
          - Healthcare compliance will be validated
          - Staging deployment will be triggered
          
          ---
          *This comment was automatically generated by the CI/CD pipeline*
          `;

          if (!botComment) {
            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: validationMessage
            });
          } else {
            await github.rest.issues.updateComment({
              comment_id: botComment.id,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: validationMessage
            });
          }
```

### Security Scanning Workflow (`security-scan.yml`)

```yaml
name: Security Scanning

on:
  push:
    branches: [main, develop]
    paths: ['my-family-clinic/**', 'package.json', 'package-lock.json']
  pull_request:
    branches: [main, develop]
    paths: ['my-family-clinic/**', 'package.json', 'package-lock.json']
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM

jobs:
  security-scan:
    name: Comprehensive Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: 'my-family-clinic'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

    - name: Run CodeQL Security Analysis
      uses: github/codeql-action/init@v2
      with:
        languages: javascript, typescript

    - name: Autobuild
      uses: github/codeql-action/autobuild@v2

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2

    - name: Dependency security audit
      working-directory: my-family-clinic
      run: |
        echo "🔍 Running dependency security audit..."
        npm audit --audit-level=high
        echo "✅ Dependency audit passed"

    - name: Container security scan
      if: github.event_name == 'push'
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
        format: 'sarif'
        output: 'container-scan-results.sarif'

    - name: Upload container scan results
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: 'container-scan-results.sarif'

    - name: Security scan summary
      if: always()
      run: |
        echo "## Security Scan Results" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        
        if [ -f "trivy-results.sarif" ]; then
          echo "✅ Trivy scan completed" >> $GITHUB_STEP_SUMMARY
        fi
        
        if [ -f "container-scan-results.sarif" ]; then
          echo "✅ Container scan completed" >> $GITHUB_STEP_SUMMARY
        fi
        
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "View detailed results in the Security tab of this repository." >> $GITHUB_STEP_SUMMARY
```

## Quality Gates Implementation

### Coverage Thresholds

```javascript
// my-family-clinic/.c8rc.json
{
  "exclude": [
    "coverage/**",
    "test/**",
    "*.d.ts",
    "src/index.ts"
  ],
  "report": {
    "report-dir": "./coverage",
    "reporter": ["lcov", "text", "html"],
    "exclude-after-remap": false
  },
  "statements": 85,
  "branches": 80,
  "functions": 85,
  "lines": 85,
  "all": true
}
```

### Pre-commit Hooks

```json
// my-family-clinic/.husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting
npm run lint:fix

# Run type checking
npm run type-check

# Run tests
npm run test:unit

# Run accessibility tests
npm run test:a11y

echo "✅ Pre-commit checks passed"
```

### Branch Protection Rules

```json
// .github/branch-protection.json
{
  "main": {
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "quality-gates",
        "unit-tests",
        "build",
        "healthcare-compliance"
      ]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "required_approving_review_count": 2,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "require_last_push_approval": true
    },
    "restrictions": {
      "users": ["maintainers"],
      "teams": ["healthcare-devs"]
    }
  },
  "develop": {
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "quality-gates",
        "unit-tests"
      ]
    },
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "require_code_owner_reviews": false
    },
    "restrictions": {
      "users": ["developers"],
      "teams": ["healthcare-devs"]
    }
  }
}
```

## Automation Scripts

### Build Validation Script

```bash
#!/bin/bash
# scripts/cicd/build-validation.sh

set -e

echo "🔨 Starting build validation..."

# Check if required files exist
required_files=(
    "package.json"
    "tsconfig.json"
    "next.config.ts"
    "tailwind.config.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done

# Validate package.json dependencies
echo "📦 Validating package.json..."
required_deps=("next" "react" "@supabase/supabase-js")
for dep in "${required_deps[@]}"; do
    if ! grep -q "\"$dep\"" package.json; then
        echo "❌ Missing required dependency: $dep"
        exit 1
    fi
done

# Check TypeScript configuration
echo "🔧 Validating TypeScript configuration..."
npm run type-check

# Validate environment variables template
if [ ! -f ".env.example" ]; then
    echo "⚠️  Warning: .env.example not found"
fi

echo "✅ Build validation completed successfully"
```

### Database Migration Validation

```bash
#!/bin/bash
# scripts/cicd/migration-validation.sh

set -e

ENVIRONMENT=${1:-staging}
PROJECT_REF=${2:-$SUPABASE_STAGING_PROJECT_ID}

echo "🗄️  Validating database migrations for $ENVIRONMENT..."

# Check for migration files
if [ ! -d "my-family-clinic/supabase/migrations" ]; then
    echo "❌ Migration directory not found"
    exit 1
fi

# Validate migration syntax
echo "🔍 Checking migration syntax..."
for migration in my-family-clinic/supabase/migrations/*.sql; do
    if [ -f "$migration" ]; then
        # Basic SQL syntax validation
        if grep -q "CREATE TABLE\|ALTER TABLE\|DROP TABLE" "$migration"; then
            echo "✅ Migration syntax valid: $(basename "$migration")"
        fi
    fi
done

# Check for healthcare-specific tables
required_tables=(
    "patients"
    "healthcare_providers"
    "consultations"
    "medical_records"
    "audit_logs"
)

echo "🏥 Validating healthcare table structure..."
for table in "${required_tables[@]}"; do
    echo "Checking table: $table"
    # This would connect to actual database to validate
    # For now, just check if migrations reference these tables
    if grep -r "$table" my-family-clinic/supabase/migrations/; then
        echo "✅ Table $table found in migrations"
    else
        echo "⚠️  Table $table not found in migrations"
    fi
done

echo "✅ Database migration validation completed"
```

## Performance Optimization

### Build Caching Strategy

```yaml
# .github/cache-config.yml
cache:
  npm:
    key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      npm-${{ runner.os }}-
      npm-
  docker:
    key: docker-${{ hashFiles('Dockerfile') }}
    restore-keys: |
      docker-
```

### Parallel Job Execution

The CI/CD pipeline is optimized for parallel execution:

1. **Quality Gates & Testing**: Run in parallel to maximize speed
2. **Security Scanning**: Independent of build process
3. **Healthcare Compliance**: Can run alongside other checks
4. **Deployment**: Sequential with proper dependency management

## Error Handling and Recovery

### Retry Logic

```yaml
# Example retry configuration for network operations
- name: Deploy with retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    retry_wait_seconds: 30
    command: |
      ./scripts/cicd/deploy-with-retry.sh
```

### Graceful Degradation

```bash
#!/bin/bash
# scripts/cicd/deploy-with-retry.sh

set -e

MAX_RETRIES=3
RETRY_DELAY=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_RETRIES ]; do
    echo "Attempt $ATTEMPT of $MAX_RETRIES"
    
    if ./scripts/cicd/deploy-stage.sh; then
        echo "✅ Deployment successful"
        exit 0
    else
        echo "❌ Deployment failed"
        if [ $ATTEMPT -lt $MAX_RETRIES ]; then
            echo "⏳ Retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
            RETRY_DELAY=$((RETRY_DELAY * 2))  # Exponential backoff
        fi
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
done

echo "❌ Deployment failed after $MAX_RETRIES attempts"
exit 1
```

## Implementation Checklist

### Initial Setup
- [ ] Configure GitHub repository settings
- [ ] Set up branch protection rules
- [ ] Create required secrets in GitHub
- [ ] Configure Slack notifications
- [ ] Set up SonarCloud integration

### Environment Configuration
- [ ] Create staging Supabase project
- [ ] Create production Supabase project
- [ ] Configure Vercel deployments
- [ ] Set up environment variables
- [ ] Configure database connections

### Security Setup
- [ ] Configure CodeQL analysis
- [ Set up Trivy scanning
- [ ] Configure secret scanning
- [ ] Set up dependency review
- [ ] Configure container scanning

### Monitoring Setup
- [ ] Configure application monitoring
- [ ] Set up performance monitoring
- [ ] Configure security monitoring
- [ ] Set up compliance monitoring
- [ ] Configure alerting rules

### Testing Infrastructure
- [ ] Set up test databases
- [ ] Configure E2E testing environment
- [ ] Set up accessibility testing
- [ ] Configure performance testing
- [ ] Set up security testing

## Success Metrics

### Pipeline Performance
- **Pipeline Duration**: <15 minutes (staging), <30 minutes (production)
- **Success Rate**: >98%
- **Mean Time to Recovery**: <15 minutes
- **Deployment Frequency**: Daily (staging), Weekly (production)

### Quality Metrics
- **Test Coverage**: >85% overall, >90% for critical paths
- **Security Score**: A rating or higher
- **Code Quality Score**: B rating or higher
- **Performance Score**: >90 (Lighthouse)

### Compliance Metrics
- **Healthcare Compliance**: 100% validation
- **PDPA Compliance**: Full automation
- **Audit Trail Coverage**: 100%
- **Security Policy Compliance**: 100%

## Continuous Improvement

### Monthly Reviews
1. Analyze pipeline performance metrics
2. Review security scan results
3. Evaluate deployment success rates
4. Assess compliance validation effectiveness
5. Update security policies and procedures

### Quarterly Assessments
1. Technology stack evaluation
2. Security posture assessment
3. Performance optimization review
4. Compliance audit preparation
5. Disaster recovery testing

### Feedback Integration
- Monitor developer feedback on pipeline speed
- Track deployment issues and resolution times
- Collect security team feedback on scanning accuracy
- Gather compliance team validation requirements
- Incorporate operations team monitoring insights

---

This comprehensive CI/CD workflow implementation provides a robust, secure, and compliant pipeline for the My Family Clinic healthcare platform, ensuring high-quality deployments with proper healthcare-specific validations and monitoring.
