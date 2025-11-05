# CI/CD Pipeline Configuration

## Overview

This document outlines the comprehensive CI/CD pipeline for the Healthcare Data Analytics Platform, implementing automated testing, security scanning, and deployment processes with healthcare compliance requirements.

## Pipeline Architecture

### Workflow Structure
```mermaid
graph TD
    A[Push to Repository] --> B[Pull Request]
    B --> C[Automated Tests]
    C --> D[Security Scanning]
    D --> E[Code Quality Checks]
    E --> F[Build & Package]
    F --> G[Deploy to Staging]
    G --> H[Integration Tests]
    H --> I[UAT Validation]
    I --> J[Deploy to Production]
    J --> K[Health Checks]
    K --> L[Post-Deployment Monitoring]
```

## GitHub Actions Configuration

### Main Workflow File
```yaml
# .github/workflows/healthcare-ci-cd.yml
name: Healthcare Platform CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    # Daily security scan
    - cron: '0 2 * * *'

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'
  DOCKER_BUILDKIT: 1

jobs:
  # =================== TESTING PHASE ===================
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: healthcare_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Full history for coverage

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests with coverage
      run: |
        npm run test:unit -- --coverage --coverageReporters=lcov
        npm run test:integration -- --coverage
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/healthcare_test
        JWT_SECRET: test-secret-key
        NODE_ENV: test

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  security-tests:
    name: Security Testing
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

    - name: Run CodeQL Security Analysis
      uses: github/codeql-action/init@v2
      with:
        languages: javascript, python

    - name: Autobuild
      uses: github/codeql-action/autobuild@v2

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2

  quality-checks:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run ESLint
      run: npm run lint

    - name: Run Prettier check
      run: npm run format:check

    - name: Run TypeScript check
      run: npm run type-check

    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # =================== BUILD PHASE ===================
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [unit-tests, security-tests, quality-checks]
    
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production

    - name: Build Docker image
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ghcr.io/${{ github.repository }}/healthcare-app
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # =================== DEPLOYMENT PHASE ===================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to Staging Environment
      run: |
        ./scripts/deploy-staging.sh \
          --image-tag ${{ needs.build.outputs.image-tag }} \
          --environment staging
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_STAGING_PROJECT_ID }}

    - name: Run smoke tests
      run: |
        ./scripts/smoke-tests.sh staging
      env:
        STAGING_URL: https://staging.healthcare-app.com

    - name: Integration Tests
      run: |
        npm run test:e2e -- --config=e2e/staging.config.js
      env:
        E2E_BASE_URL: https://staging.healthcare-app.com

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, deploy-staging]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Pre-deployment checks
      run: |
        ./scripts/pre-prod-check.sh
      env:
        PRODUCTION_URL: https://healthcare-app.com

    - name: Database migration
      run: |
        ./scripts/migrate-prod.sh
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROD_PROJECT_ID }}

    - name: Deploy to Production
      run: |
        ./scripts/deploy-production.sh \
          --image-tag ${{ needs.build.outputs.image-tag }} \
          --environment production
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROD_PROJECT_ID }}

    - name: Post-deployment validation
      run: |
        ./scripts/post-deploy-validate.sh production
      env:
        PRODUCTION_URL: https://healthcare-app.com

    - name: Send deployment notification
      run: |
        ./scripts/notify-deployment.sh production ${{ github.sha }}
      env:
        SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}

  # =================== MONITORING PHASE ===================
  monitoring:
    name: Post-Deployment Monitoring
    runs-on: ubuntu-latest
    needs: deploy-production
    if: always()
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Wait for metrics collection
      run: sleep 300

    - name: Health check monitoring
      run: |
        ./scripts/monitoring-check.sh production
      env:
        PRODUCTION_URL: https://healthcare-app.com
        MONITORING_API_KEY: ${{ secrets.MONITORING_API_KEY }}

    - name: Performance monitoring
      run: |
        ./scripts/performance-check.sh
      env:
        PRODUCTION_URL: https://healthcare-app.com
```

### Pull Request Workflow
```yaml
# .github/workflows/pr-checks.yml
name: Pull Request Checks

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  pr-checks:
    name: PR Validation
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout PR branch
      uses: actions/checkout@v4
      with:
        ref: ${{ github.event.pull_request.head.sha }}

    - name: Validate PR
      run: |
        ./scripts/validate-pr.sh
      env:
        PR_NUMBER: ${{ github.event.number }}
        PR_BRANCH: ${{ github.event.pull_request.head.ref }}

    - name: Run quick tests
      run: |
        npm run test:quick
      env:
        CI: true

    - name: Comment on PR
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

          if (!botComment) {
            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ PR Validation Complete\n\nAll checks passed successfully!'
            });
          }
```

## Testing Strategy

### Test Configuration
```json
// jest.config.js
module.exports = {
  preset: '@testing-library/react',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ]
};
```

### Integration Testing
```typescript
// tests/integration/healthcare-features.spec.ts
describe('Healthcare Features Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    await seedTestData();
  });

  describe('Patient Data Management', () => {
    it('should create and retrieve patient records securely', async () => {
      const patient = await createTestPatient({
        name: 'Test Patient',
        dateOfBirth: '1990-01-01',
        medicalRecordNumber: 'TEST-001'
      });

      const retrievedPatient = await getPatientById(patient.id);
      
      expect(retrievedPatient).toBeDefined();
      expect(retrievedPatient.medicalRecordNumber).toBe('TEST-001');
      expect(retrievedPatient.pii).toBeUndefined(); // PII should be encrypted
    });

    it('should enforce healthcare access controls', async () => {
      const patient = await createTestPatient();
      const unauthorizedUser = await createTestUser({ role: 'patient' });

      await expect(
        getPatientRecords(unauthorizedUser.id, patient.id)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('Audit Logging', () => {
    it('should log all patient data access', async () => {
      const user = await createTestUser({ role: 'doctor' });
      const patient = await createTestPatient();

      await accessPatientRecord(user.id, patient.id);

      const auditLog = await getAuditLog({
        userId: user.id,
        patientId: patient.id,
        action: 'READ'
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.action).toBe('READ');
    });
  });
});
```

### E2E Testing with Playwright
```typescript
// e2e/healthcare-app.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Healthcare Application E2E', () => {
  test('complete patient consultation workflow', async ({ page }) => {
    // Login as healthcare provider
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'doctor@example.com');
    await page.fill('[data-testid=password]', 'secure-password');
    await page.click('[data-testid=login-button]');

    // Navigate to patient records
    await page.click('[data-testid=patient-records]');
    await expect(page.locator('[data-testid=patient-list]')).toBeVisible();

    // Select patient and view records
    await page.click('[data-testid=patient-0]');
    await expect(page.locator('[data-testid=patient-profile]')).toBeVisible();

    // Create new consultation note
    await page.click('[data-testid=new-consultation]');
    await page.fill('[data-testid=chief-complaint]', 'Patient reports chest pain');
    await page.fill('[data-testid=diagnosis]', 'Chest pain - rule out cardiac');
    
    // Save with audit logging
    await page.click('[data-testid=save-consultation]');
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
  });
});
```

## Security Scanning Integration

### Container Security
```yaml
# .github/workflows/container-security.yml
name: Container Security Scan

on:
  push:
    branches: [ main, develop ]
    paths: ['Dockerfile', 'docker-compose.yml', 'package.json']

jobs:
  container-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Build Docker image
      run: docker build -t healthcare-app:${{ github.sha }} .

    - name: Run Trivy container scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'healthcare-app:${{ github.sha }}'
        format: 'sarif'
        output: 'trivy-container-results.sarif'

    - name: Upload container scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-container-results.sarif'

    - name: Run Snyk security scan
      uses: snyk/actions/docker@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        image: 'healthcare-app:${{ github.sha }}'
        args: --severity-threshold=high

  dependency-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run npm audit
      run: npm audit --audit-level=high

    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SYNK_TOKEN }}
      with:
        args: --severity-threshold=high
```

## Deployment Scripts

### Staging Deployment Script
```bash
#!/bin/bash
# scripts/deploy-staging.sh

set -e

IMAGE_TAG=${1:-latest}
ENVIRONMENT=${2:-staging}

echo "🚀 Deploying to staging environment..."

# Validate environment
if [ "$ENVIRONMENT" != "staging" ]; then
    echo "❌ Invalid environment. Only 'staging' allowed."
    exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
./scripts/pre-deployment-checks.sh $ENVIRONMENT

# Update deployment
echo "📦 Updating deployment..."
kubectl set image deployment/healthcare-app \
  healthcare-app=ghcr.io/org/healthcare-app:$IMAGE_TAG \
  --namespace=staging

# Wait for rollout
echo "⏳ Waiting for deployment to complete..."
kubectl rollout status deployment/healthcare-app \
  --namespace=staging --timeout=300s

# Run database migrations
echo "🗄️ Running database migrations..."
kubectl exec -n staging deployment/healthcare-app -- \
  npm run migrate:staging

# Validate deployment
echo "✅ Validating deployment..."
./scripts/validate-deployment.sh staging

echo "🎉 Staging deployment completed successfully!"
```

### Production Deployment Script
```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

IMAGE_TAG=${1:-latest}
ENVIRONMENT=${2:-production}

echo "🚀 Deploying to production environment..."

# Security validation
echo "🔒 Running security validation..."
./scripts/security-validate.sh production

# Create backup
echo "💾 Creating production backup..."
./scripts/create-backup.sh production

# Enable maintenance mode
echo "🚧 Enabling maintenance mode..."
./scripts/maintenance-mode.sh enable

# Database migration
echo "🗄️ Running database migrations..."
supabase db push --project-ref $SUPABASE_PROJECT_ID

# Deploy with zero-downtime
echo "📦 Deploying application..."
./scripts/zero-downtime-deploy.sh $IMAGE_TAG

# Health checks
echo "🏥 Running health checks..."
./scripts/health-checks.sh production

# Disable maintenance mode
echo "✅ Disabling maintenance mode..."
./scripts/maintenance-mode.sh disable

# Post-deployment validation
echo "🔍 Post-deployment validation..."
./scripts/post-deployment-validation.sh production

echo "🎉 Production deployment completed successfully!"
```

## Quality Gates

### Commit Message Standards
```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid commit message format."
    echo "✅ Expected format: type(scope): description"
    echo "📝 Example: feat(patient): add new patient registration API"
    exit 1
fi
```

### Branch Protection Rules
```json
// .github/branch-protection.json
{
  "main": {
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "unit-tests",
        "security-tests",
        "quality-checks",
        "build"
      ]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "required_approving_review_count": 2,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true
    },
    "restrictions": {
      "users": ["maintainers"]
    }
  }
}
```

## Notification System

### Slack Integration
```yaml
# .github/workflows/notifications.yml
name: Deployment Notifications

on:
  workflow_run:
    workflows: ["Healthcare Platform CI/CD"]
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion != 'success' }}
    
    steps:
    - name: Notify Slack on failure
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#healthcare-deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        fields: repo,message,commit,author,action,eventName,ref,workflow
```

## Monitoring & Alerting

### Pipeline Metrics
- **Deployment Frequency**: Target: 1 deployment per day (staging)
- **Lead Time**: Target: <4 hours from commit to production
- **Mean Time to Recovery**: Target: <15 minutes
- **Change Failure Rate**: Target: <5%

### Alert Thresholds
```yaml
# alerts.yml
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 0.05"
    duration: "2m"
    severity: "critical"
    
  - name: "Slow Response Time"
    condition: "response_time_p95 > 2s"
    duration: "5m"
    severity: "warning"
    
  - name: "Failed Tests"
    condition: "test_failure_rate > 0.1"
    duration: "1m"
    severity: "critical"
```

## Continuous Improvement

### Monthly Reviews
- Pipeline performance analysis
- Security scan results review
- Deployment success rate metrics
- Cost optimization opportunities

### Quarterly Assessments
- Technology stack evaluation
- Security posture improvement
- Compliance audit preparation
- Disaster recovery testing

---

## CI/CD Pipeline Summary

### Key Features
- **Automated Testing**: Unit, integration, e2e, and security tests
- **Security Scanning**: Vulnerability assessment and container scanning
- **Quality Gates**: Code coverage, linting, and commit standards
- **Deployment Automation**: Staging and production deployments
- **Monitoring**: Health checks and performance monitoring
- **Notifications**: Slack integration for team awareness
- **Compliance**: Healthcare data handling validation

### Success Metrics
- **Test Coverage**: >90%
- **Security Score**: A rating or higher
- **Deployment Success Rate**: >99%
- **Mean Time to Recovery**: <15 minutes
- **Lead Time**: <4 hours

### Next Steps
1. Set up GitHub Actions workflows
2. Configure environment secrets
3. Implement monitoring dashboards
4. Establish runbook procedures
5. Conduct pipeline security audit