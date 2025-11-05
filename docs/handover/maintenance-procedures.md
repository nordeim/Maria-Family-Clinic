# Maintenance Procedures - My Family Clinic Healthcare Platform

## Overview

This document provides comprehensive procedures for maintaining the My Family Clinic Healthcare Platform. It covers daily, weekly, monthly, and quarterly maintenance tasks, along with troubleshooting guides, performance monitoring, and emergency response procedures.

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Weekly Maintenance](#weekly-maintenance)
3. [Monthly Procedures](#monthly-procedures)
4. [Quarterly Reviews](#quarterly-reviews)
5. [Performance Monitoring](#performance-monitoring)
6. [Security Maintenance](#security-maintenance)
7. [Database Maintenance](#database-maintenance)
8. [Backup & Recovery](#backup--recovery)
9. [Emergency Procedures](#emergency-procedures)
10. [Troubleshooting Guide](#troubleshooting-guide)

## Daily Operations

### Automated Monitoring Checks

#### System Health Monitoring
```bash
#!/bin/bash
# Daily health check script
# Run at 8:00 AM SGT daily via cron

echo "=== Daily Health Check - $(date) ==="

# Check application status
curl -f -s https://production-url.com/health || echo "❌ Application health check failed"

# Check database connectivity
pg_isready -h database-host -p 5432 || echo "❌ Database connection failed"

# Check disk space (warn if >80% used)
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Warning: Disk usage at ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
if (( $(echo "$MEM_USAGE > 90" | bc -l) )); then
    echo "⚠️  Warning: Memory usage at ${MEM_USAGE}%"
fi

# Check error logs for critical errors
grep -i "error\|exception\|critical" /var/log/application.log | tail -10

echo "=== Health Check Complete ==="
```

#### Database Health Check
```sql
-- Daily database health check queries

-- Check active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Check database size
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) as size
FROM pg_database
WHERE datname = current_database();

-- Check for long-running queries
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    now() - query_start as duration,
    left(query, 100) as query_preview
FROM pg_stat_activity
WHERE state = 'active' 
AND query_start < now() - interval '5 minutes'
ORDER BY duration DESC;

-- Check for database locks
SELECT 
    t.relname AS table_name,
    l.locktype AS lock_type,
    page,
    virtualtransaction,
    pid,
    mode,
    granted
FROM pg_locks l
JOIN pg_class t ON l.relation = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog')
ORDER BY relation ASC;

-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Log Review Procedures

#### Application Logs Review
```bash
#!/bin/bash
# Daily log review script

LOG_PATH="/var/log/my-family-clinic"
DATE=$(date +%Y-%m-%d)

echo "=== Daily Log Review - $DATE ==="

# Check for critical errors in the last 24 hours
echo "Critical Errors:"
grep -i "critical\|fatal\|error" $LOG_PATH/application.log | \
    grep "$(date -d '24 hours ago' '+%Y-%m-%d %H')" | \
    tail -20

# Check authentication failures
echo "Authentication Failures:"
grep "authentication failed" $LOG_PATH/auth.log | \
    grep "$(date -d '24 hours ago' '+%Y-%m-%d')" | \
    tail -10

# Check API response times
echo "Slow API Responses (>2s):"
grep "response_time.*[2-9][0-9][0-9][0-9]ms\|response_time.*[1-9][0-9][0-9][0-9][0-9]ms" $LOG_PATH/api.log | \
    grep "$(date -d '24 hours ago' '+%Y-%m-%d')" | \
    tail -20

# Generate daily log summary
echo "Log Summary for $DATE:"
echo "Total lines: $(grep "$(date -d '24 hours ago' '+%Y-%m-%d')" $LOG_PATH/application.log | wc -l)"
echo "Errors: $(grep "$(date -d '24 hours ago' '+%Y-%m-%d')" $LOG_PATH/application.log | grep -i error | wc -l)"
echo "Warnings: $(grep "$(date -d '24 hours ago' '+%Y-%m-%d')" $LOG_PATH/application.log | grep -i warning | wc -l)"
```

#### Performance Metrics Collection
```typescript
// Daily performance metrics collection script
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface DailyMetrics {
  date: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  clinicSearches: number;
  doctorViews: number;
  enquiriesSubmitted: number;
  averagePageLoadTime: number;
  apiResponseTime: number;
  errorRate: number;
}

async function collectDailyMetrics(): Promise<DailyMetrics> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: userMetrics } = await supabase
    .from('user_analytics')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString());

  const { data: clinicSearches } = await supabase
    .from('search_analytics')
    .select('*')
    .eq('search_type', 'clinic')
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString());

  return {
    date: yesterday.toISOString().split('T')[0],
    totalUsers: userMetrics?.length || 0,
    newUsers: userMetrics?.filter(u => u.is_new_user).length || 0,
    activeUsers: userMetrics?.filter(u => u.session_duration > 300).length || 0,
    clinicSearches: clinicSearches?.length || 0,
    doctorViews: 0, // Add when implemented
    enquiriesSubmitted: 0, // Add when implemented
    averagePageLoadTime: 0, // Collect from monitoring service
    apiResponseTime: 0, // Collect from monitoring service
    errorRate: 0, // Calculate from error logs
  };
}

// Store metrics in database
async function storeMetrics(metrics: DailyMetrics) {
  await supabase
    .from('daily_metrics')
    .insert(metrics);
}

// Run daily collection
collectDailyMetrics()
  .then(storeMetrics)
  .then(() => console.log('Daily metrics collected successfully'))
  .catch(console.error);
```

### User Support Monitoring

#### Daily Support Ticket Review
```sql
-- Check support tickets from last 24 hours
SELECT 
    id,
    subject,
    status,
    priority,
    created_at,
    updated_at,
    assigned_to,
    category
FROM enquiries
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY priority DESC, created_at DESC;

-- Identify overdue tickets
SELECT 
    id,
    subject,
    status,
    priority,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 as age_hours,
    assigned_to
FROM enquiries
WHERE status NOT IN ('RESOLVED', 'CLOSED')
AND EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 > 24
ORDER BY age_hours DESC;

-- Support category breakdown
SELECT 
    category,
    COUNT(*) as ticket_count,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_resolution_hours
FROM enquiries
WHERE created_at >= NOW() - INTERVAL '24 hours'
AND status = 'RESOLVED'
GROUP BY category
ORDER BY ticket_count DESC;
```

## Weekly Maintenance

### Database Optimization

#### Weekly Database Maintenance Script
```sql
-- Weekly database maintenance procedures

-- 1. Update table statistics for query optimization
ANALYZE;

-- 2. Reindex heavily used tables
REINDEX DATABASE myfamilyclinic;

-- 3. Vacuum tables to reclaim space and update statistics
VACUUM ANALYZE clinics;
VACUUM ANALYZE doctors;
VACUUM ANALYZE services;
VACUUM ANALYZE enquiries;
VACUUM ANALYZE user_analytics;

-- 4. Check for unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED - Consider dropping'
        WHEN idx_scan < 100 THEN 'LOW USAGE'
        ELSE 'ACTIVE'
    END as usage_status
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- 5. Check for table bloat
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats
WHERE schemaname = 'public'
AND tablename IN ('clinics', 'doctors', 'services', 'enquiries')
ORDER BY tablename, attname;

-- 6. Monitor long-running transactions
SELECT 
    pid,
    usesysid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    now() - query_start as duration,
    left(query, 100) as query_preview
FROM pg_stat_activity
WHERE state = 'active' 
AND query_start < now() - interval '10 minutes'
ORDER BY duration DESC;
```

#### Query Performance Analysis
```sql
-- Weekly query performance analysis

-- Find slow queries from the last week
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100  -- queries taking more than 100ms on average
ORDER BY mean_time DESC
LIMIT 20;

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats s
JOIN pg_class c ON c.relname = s.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND NOT EXISTS (
    SELECT 1 
    FROM pg_index i 
    WHERE i.indrelid = c.oid 
    AND i.indkey[0] = s.attnum 
    AND i.indisprimary = false
)
AND n_distinct > 10  -- columns with high cardinality
ORDER BY n_distinct DESC
LIMIT 20;

-- Table size analysis
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats s
JOIN pg_class c ON c.relname = s.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND n_distinct > 10
ORDER BY n_distinct DESC
LIMIT 20;
```

### Security Updates

#### Weekly Security Checklist
```bash
#!/bin/bash
# Weekly security maintenance script

echo "=== Weekly Security Maintenance ==="

# 1. Check for security updates
npm audit --audit-level moderate

# 2. Update dependencies (non-breaking changes only)
npm update

# 3. Check SSL certificate expiration
SSL_EXPIRY=$(echo | openssl s_client -servername production-url.com -connect production-url.com:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
SSL_EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( (SSL_EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))

echo "SSL certificate expires in $DAYS_UNTIL_EXPIRY days"

if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "⚠️  WARNING: SSL certificate expires soon!"
fi

# 4. Check failed login attempts
grep "authentication failed" /var/log/auth.log | \
    grep "$(date -d '7 days ago' '+%Y-%m-%d')" | \
    wc -l | \
    xargs echo "Failed login attempts in last week:"

# 5. Check for suspicious IP addresses
awk '/authentication failed/ {print $11}' /var/log/auth.log | \
    grep "$(date -d '7 days ago' '+%Y-%m-%d')" | \
    sort | uniq -c | sort -nr | head -10

# 6. Review user permissions
echo "Review user permissions:"
psql -c "
SELECT 
    username,
    granted_role,
    admin_option,
    granted_by,
    granted_at
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
ORDER BY username, granted_role;
"

echo "=== Security Maintenance Complete ==="
```

#### Access Control Review
```sql
-- Weekly access control review

-- Review all user roles and permissions
SELECT 
    r.rolname as role_name,
    r.rolsuper as is_superuser,
    r.rolcreaterole as can_create_roles,
    r.rolcreatedb as can_create_db,
    r.rolcanlogin as can_login
FROM pg_roles r
WHERE r.rolname NOT LIKE 'pg_%'
ORDER BY r.rolname;

-- Check table-level permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Review RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for excessive permissions
SELECT 
    grantee,
    privilege_type,
    table_name
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND grantee NOT IN ('postgres', 'supabase_admin', 'service_role')
ORDER BY grantee, privilege_type;
```

### Performance Review

#### Weekly Performance Analysis
```typescript
// Weekly performance review script
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface WeeklyPerformanceReport {
  weekEnding: string;
  averagePageLoadTime: number;
  averageApiResponseTime: number;
  errorRate: number;
  topSlowPages: { page: string; avgLoadTime: number }[];
  topErrorPages: { page: string; errorCount: number }[];
  databaseQueryPerformance: { query: string; avgTime: number; calls: number }[];
}

async function generateWeeklyPerformanceReport(): Promise<WeeklyPerformanceReport> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  // Get page performance data
  const { data: pagePerformance } = await supabase
    .from('performance_metrics')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());

  // Get API performance data
  const { data: apiPerformance } = await supabase
    .from('api_metrics')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());

  // Get error data
  const { data: errors } = await supabase
    .from('error_logs')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());

  const report: WeeklyPerformanceReport = {
    weekEnding: endDate.toISOString().split('T')[0],
    averagePageLoadTime: calculateAverage(pagePerformance?.map(p => p.loadTime) || []),
    averageApiResponseTime: calculateAverage(apiPerformance?.map(a => a.responseTime) || []),
    errorRate: errors ? (errors.length / (pagePerformance?.length || 1)) * 100 : 0,
    topSlowPages: getTopSlowPages(pagePerformance || []),
    topErrorPages: getTopErrorPages(errors || []),
    databaseQueryPerformance: await getDatabaseQueryPerformance(),
  };

  return report;
}

function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

function getTopSlowPages(performance: any[]): { page: string; avgLoadTime: number }[] {
  const pageGroups = performance.reduce((acc, perf) => {
    if (!acc[perf.page]) {
      acc[perf.page] = [];
    }
    acc[perf.page].push(perf.loadTime);
    return acc;
  }, {} as Record<string, number[]>);

  return Object.entries(pageGroups)
    .map(([page, times]) => ({ page, avgLoadTime: calculateAverage(times) }))
    .sort((a, b) => b.avgLoadTime - a.avgLoadTime)
    .slice(0, 5);
}

function getTopErrorPages(errors: any[]): { page: string; errorCount: number }[] {
  const errorGroups = errors.reduce((acc, error) => {
    acc[error.page] = (acc[error.page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(errorGroups)
    .map(([page, count]) => ({ page, errorCount: count }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 5);
}

async function getDatabaseQueryPerformance() {
  // This would typically query pg_stat_statements
  // For now, return a placeholder structure
  return [
    { query: 'SELECT * FROM clinics WHERE status = ?', avgTime: 45.2, calls: 1250 },
    { query: 'SELECT * FROM doctors WHERE specialty = ?', avgTime: 38.7, calls: 890 },
    { query: 'SELECT * FROM enquiries WHERE status = ?', avgTime: 25.1, calls: 567 },
  ];
}

// Generate and store report
generateWeeklyPerformanceReport()
  .then(report => {
    console.log('Weekly Performance Report:', report);
    // Store report in database
    return supabase.from('performance_reports').insert(report);
  })
  .then(() => console.log('Performance report stored successfully'))
  .catch(console.error);
```

## Monthly Procedures

### Capacity Planning

#### Database Capacity Analysis
```sql
-- Monthly capacity planning analysis

-- Database growth trend over last 6 months
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as record_count,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as table_size
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND t.table_name IN ('clinics', 'doctors', 'services', 'enquiries', 'user_analytics')
GROUP BY month, tablename
ORDER BY month DESC, tablename;

-- Index usage and effectiveness
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'LOW USAGE'
        WHEN idx_scan < 100 THEN 'MODERATE USAGE'
        ELSE 'HIGH USAGE'
    END as usage_level
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Query performance trend
SELECT 
    DATE_TRUNC('month', query_start) as month,
    query,
    AVG(mean_time) as avg_execution_time,
    COUNT(*) as execution_count,
    SUM(calls) as total_calls
FROM pg_stat_statements
WHERE query_start >= NOW() - INTERVAL '6 months'
GROUP BY month, query
ORDER BY month DESC, avg_execution_time DESC
LIMIT 50;

-- Resource utilization trends
SELECT 
    DATE_TRUNC('day', timestamp) as day,
    AVG(cpu_usage) as avg_cpu,
    AVG(memory_usage) as avg_memory,
    AVG(disk_usage) as avg_disk
FROM system_metrics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

#### Infrastructure Scaling Recommendations
```typescript
// Monthly infrastructure review
interface InfrastructureRecommendations {
  database: {
    currentConnections: number;
    maxConnections: number;
    connectionUtilization: number;
    recommendedAction: string;
  };
  application: {
    currentMemoryUsage: number;
    peakMemoryUsage: number;
    recommendedAction: string;
  };
  storage: {
    currentUsage: number;
    growthRate: number;
    estimatedExhaustion: string;
    recommendedAction: string;
  };
}

async function generateInfrastructureRecommendations(): Promise<InfrastructureRecommendations> {
  // This would integrate with monitoring services
  // For now, providing structure
  
  return {
    database: {
      currentConnections: 45,
      maxConnections: 100,
      connectionUtilization: 45,
      recommendedAction: "Current capacity sufficient. Monitor for growth.",
    },
    application: {
      currentMemoryUsage: 65,
      peakMemoryUsage: 85,
      recommendedAction: "Consider increasing memory allocation if trend continues.",
    },
    storage: {
      currentUsage: 70,
      growthRate: 5, // GB per month
      estimatedExhaustion: "12 months",
      recommendedAction: "Plan storage expansion within 6 months.",
    },
  };
}
```

### Compliance Audit

#### Monthly Compliance Checklist
```sql
-- Monthly compliance audit queries

-- PDPA compliance check
-- Verify user consent tracking
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN consent_given = true THEN 1 END) as users_with_consent,
    COUNT(CASE WHEN consent_date IS NOT NULL THEN 1 END) as users_with_consent_date,
    COUNT(CASE WHEN consent_updated_at > NOW() - INTERVAL '1 year' THEN 1 END) as recent_consent
FROM user_profiles;

-- Data retention compliance
SELECT 
    table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record,
    CASE 
        WHEN MAX(created_at) < NOW() - INTERVAL '7 years' THEN 'EXPIRED - ARCHIVE'
        WHEN MAX(created_at) < NOW() - INTERVAL '5 years' THEN 'EXPIRING SOON'
        ELSE 'COMPLIANT'
    END as retention_status
FROM enquiries
GROUP BY table_name;

-- Audit trail completeness
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_operations,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as operations_with_user,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ip_addresses
FROM audit_log
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month DESC;

-- Data encryption verification
SELECT 
    table_name,
    column_name,
    data_type,
    is_encrypted
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'enquiries', 'health_records')
AND is_encrypted = false
ORDER BY table_name, column_name;
```

#### Security Assessment
```bash
#!/bin/bash
# Monthly security assessment script

echo "=== Monthly Security Assessment ==="

# 1. Password policy compliance
echo "Checking password policies..."
# This would integrate with your authentication system

# 2. Access review
echo "User access review:"
psql -c "
SELECT 
    username,
    created_at,
    last_login,
    CASE 
        WHEN last_login < NOW() - INTERVAL '90 days' THEN 'DORMANT'
        WHEN last_login < NOW() - INTERVAL '30 days' THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END as account_status
FROM auth.users
ORDER BY last_login DESC NULLS LAST;
"

# 3. API key rotation check
echo "API key rotation status:"
# Check when API keys were last rotated

# 4. SSL/TLS configuration check
echo "SSL/TLS configuration:"
curl -sI https://production-url.com | grep -E "(HTTP|Server|Strict-Transport-Security)"

# 5. Security headers check
echo "Security headers:"
curl -sI https://production-url.com | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Content-Security-Policy)"

# 6. Vulnerability scan summary
echo "Vulnerability scan results:"
# This would integrate with your vulnerability scanner

echo "=== Security Assessment Complete ==="
```

### Dependency Updates

#### Monthly Dependency Review
```bash
#!/bin/bash
# Monthly dependency update procedure

echo "=== Monthly Dependency Updates ==="

# 1. Check for outdated dependencies
npm outdated

# 2. Security vulnerability scan
npm audit --audit-level moderate

# 3. Update development dependencies (non-breaking)
npm update --save-dev

# 4. Review breaking changes for major updates
echo "Checking for potential breaking changes..."
npm outdated --json > outdated.json

# 5. Update documentation dependencies
cd docs && npm update

# 6. Test update impact
echo "Running tests after dependency updates..."
npm run test
npm run lint
npm run type-check

# 7. Generate dependency report
npm list --depth=0 > dependency-report.txt

echo "=== Dependency Updates Complete ==="
echo "Review dependency-report.txt for details"
```

## Quarterly Reviews

### Architecture Review

#### Quarterly Architecture Assessment
```markdown
# Quarterly Architecture Review

## System Overview
- Performance metrics trends
- Scalability assessment
- Technology stack evaluation
- Technical debt analysis

## Database Performance
- Query optimization opportunities
- Index effectiveness review
- Schema evolution requirements
- Migration planning

## Application Architecture
- Code quality trends
- Component reusability
- API design evaluation
- Integration health

## Security Posture
- Vulnerability assessment
- Access control review
- Compliance status
- Incident response readiness

## Recommendations
- Short-term improvements
- Long-term architectural changes
- Technology upgrades
- Capacity planning
```

### User Experience Review

#### Quarterly UX Analysis
```sql
-- Quarterly user experience analysis

-- User engagement metrics
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(DISTINCT user_id) as monthly_active_users,
    COUNT(DISTINCT CASE WHEN session_duration > 600 THEN user_id END) as engaged_users,
    AVG(session_duration) as avg_session_duration,
    COUNT(*) as total_sessions
FROM user_sessions
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY month
ORDER BY month;

-- Feature usage analysis
SELECT 
    feature_name,
    COUNT(*) as usage_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(session_duration) as avg_session_duration
FROM feature_usage
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY feature_name
ORDER BY usage_count DESC;

-- Search success rate
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_searches,
    COUNT(CASE WHEN result_count > 0 THEN 1 END) as successful_searches,
    COUNT(CASE WHEN user_clicked_result THEN 1 END) as clicked_searches,
    AVG(result_count) as avg_results_per_search
FROM search_analytics
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY month
ORDER BY month;

-- Mobile vs desktop usage
SELECT 
    DATE_TRUNC('month', created_at) as month,
    device_type,
    COUNT(*) as session_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(session_duration) as avg_session_duration
FROM user_sessions
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY month, device_type
ORDER BY month, device_type;

-- Error rate by page
SELECT 
    page_path,
    COUNT(*) as page_views,
    COUNT(CASE WHEN has_error THEN 1 END) as error_count,
    (COUNT(CASE WHEN has_error THEN 1 END)::float / COUNT(*)) * 100 as error_rate
FROM page_views pv
LEFT JOIN errors e ON e.session_id = pv.session_id AND e.page_path = pv.page_path
WHERE pv.created_at >= NOW() - INTERVAL '3 months'
GROUP BY page_path
HAVING COUNT(*) > 100
ORDER BY error_rate DESC
LIMIT 20;
```

### Business Impact Assessment

#### Quarterly Business Metrics
```typescript
// Quarterly business impact assessment
interface QuarterlyBusinessMetrics {
  period: string;
  userGrowth: {
    newUsers: number;
    returningUsers: number;
    userRetention: number;
  };
  platformUsage: {
    clinicSearches: number;
    doctorViews: number;
    enquiriesSubmitted: number;
    healthierSGInteractions: number;
  };
  operationalEfficiency: {
    averageEnquiryResponseTime: number;
    supportTicketResolutionRate: number;
    systemUptime: number;
    apiAvailability: number;
  };
  businessOutcomes: {
    clinicsOnboarded: number;
    healthcareProviderEngagement: number;
    userSatisfactionScore: number;
    governmentComplianceScore: number;
  };
}

async function generateQuarterlyBusinessReport(): Promise<QuarterlyBusinessMetrics> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 3);

  // Calculate metrics from various data sources
  // This would integrate with analytics and business systems
  
  return {
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    userGrowth: {
      newUsers: 0, // Calculate from user registration data
      returningUsers: 0, // Calculate from session data
      userRetention: 0, // Calculate retention rate
    },
    platformUsage: {
      clinicSearches: 0, // From search analytics
      doctorViews: 0, // From page view analytics
      enquiriesSubmitted: 0, // From enquiry system
      healthierSGInteractions: 0, // From program interaction data
    },
    operationalEfficiency: {
      averageEnquiryResponseTime: 0, // From support ticket data
      supportTicketResolutionRate: 0, // From ticketing system
      systemUptime: 0, // From monitoring system
      apiAvailability: 0, // From API monitoring
    },
    businessOutcomes: {
      clinicsOnboarded: 0, // From clinic registration data
      healthcareProviderEngagement: 0, // From provider activity
      userSatisfactionScore: 0, // From user surveys
      governmentComplianceScore: 0, // From compliance audits
    },
  };
}
```

## Performance Monitoring

### Real-time Monitoring Setup

#### Application Performance Monitoring
```typescript
// Real-time performance monitoring
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Monitor page load performance
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track Core Web Vitals
  trackWebVitals() {
    if ('PerformanceObserver' in window) {
      // Track Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.sendMetric({
          name: 'lcp',
          value: lastEntry.startTime,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.sendMetric({
            name: 'fid',
            value: entry.processingStart - entry.startTime,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Track Cumulative Layout Shift
      let cumulativeLayoutShiftScore = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShiftScore += entry.value;
          }
        });
        
        this.sendMetric({
          name: 'cls',
          value: cumulativeLayoutShiftScore,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Track custom performance metrics
  trackCustomMetric(name: string, value: number, metadata?: any) {
    this.sendMetric({
      name,
      value,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      metadata,
    });
  }

  // Send metrics to database
  private async sendMetric(metric: any) {
    try {
      await supabase.from('performance_metrics').insert({
        ...metric,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance();
  monitor.trackWebVitals();
  
  // Track navigation timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      monitor.trackCustomMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
      monitor.trackCustomMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      monitor.trackCustomMetric('time_to_interactive', navigation.domInteractive - navigation.fetchStart);
    }, 0);
  });
}
```

#### API Performance Monitoring
```typescript
// API performance monitoring with tRPC
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    // Performance tracking link
    (runtime) => {
      return (op) => {
        const start = performance.now();
        
        return runtime.request(op, {
          onError: (error) => {
            const duration = performance.now() - start;
            console.error(`API Error: ${op.path} (${duration}ms)`, error);
            
            // Send error metric
            sendMetric('api_error', {
              path: op.path,
              duration,
              error: error.message,
              input: op.input,
            });
          },
          onSuccess: (result) => {
            const duration = performance.now() - start;
            console.log(`API Success: ${op.path} (${duration}ms)`);
            
            // Send success metric
            sendMetric('api_success', {
              path: op.path,
              duration,
              result: typeof result,
            });
          },
        });
      };
    },
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});

async function sendMetric(name: string, data: any) {
  // Send to monitoring service
  await fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, data, timestamp: new Date().toISOString() }),
  });
}
```

### Error Monitoring & Alerting

#### Error Tracking Setup
```typescript
// Comprehensive error tracking
class ErrorTracker {
  private static instance: ErrorTracker;
  
  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  // Capture JavaScript errors
  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      this.reportError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        type: 'promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Report error to monitoring service
  async reportError(error: any) {
    try {
      // Store locally for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error captured:', error);
      }

      // Send to error tracking service
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}

// Initialize error tracking
if (typeof window !== 'undefined') {
  const tracker = ErrorTracker.getInstance();
  tracker.setupGlobalErrorHandling();
}
```

#### Alert Configuration
```yaml
# Alert configuration (monitoring-tool.yml)
alerts:
  critical:
    - name: "High Error Rate"
      condition: "error_rate > 5%"
      duration: "5m"
      severity: "critical"
      notification: ["email", "slack", "sms"]
      
    - name: "Database Connection Failure"
      condition: "db_connected == false"
      duration: "1m"
      severity: "critical"
      notification: ["email", "slack", "sms"]
      
    - name: "High Response Time"
      condition: "api_response_time > 2000ms"
      duration: "10m"
      severity: "warning"
      notification: ["email", "slack"]
      
    - name: "Low Disk Space"
      condition: "disk_usage > 85%"
      duration: "5m"
      severity: "warning"
      notification: ["email"]
      
    - name: "SSL Certificate Expiring"
      condition: "ssl_days_until_expiry < 30"
      duration: "0m"
      severity: "warning"
      notification: ["email"]

notifications:
  email:
    - "admin@myfamilyclinic.sg"
    - "devops@myfamilyclinic.sg"
    
  slack:
    - "#healthcare-platform-alerts"
    - "#devops-alerts"
    
  sms:
    - "+65-9XXX-XXXX"  # Critical contacts
```

## Emergency Procedures

### Incident Response Plan

#### Critical Incident Response
```bash
#!/bin/bash
# Critical incident response script

INCIDENT_ID=$(date +%Y%m%d_%H%M%S)
INCIDENT_LOG="/var/log/incidents/incident_${INCIDENT_ID}.log"

echo "=== INCIDENT RESPONSE INITIATED ===" | tee -a $INCIDENT_LOG
echo "Incident ID: $INCIDENT_ID" | tee -a $INCIDENT_LOG
echo "Timestamp: $(date)" | tee -a $INCIDENT_LOG
echo "Triggered by: $1" | tee -a $INCIDENT_LOG
echo "" | tee -a $INCIDENT_LOG

# Step 1: Assess severity and notify team
echo "Step 1: Team notification" | tee -a $INCIDENT_LOG
# Send alerts to team
send_alert "CRITICAL: Incident $INCIDENT_ID detected. Response team assembled."

# Step 2: Gather initial information
echo "Step 2: Information gathering" | tee -a $INCIDENT_LOG

# Check application status
echo "Application Status:" | tee -a $INCIDENT_LOG
curl -f -s https://production-url.com/health >> $INCIDENT_LOG 2>&1 || echo "Application health check FAILED" | tee -a $INCIDENT_LOG

# Check database status
echo "Database Status:" | tee -a $INCIDENT_LOG
pg_isready -h database-host -p 5432 >> $INCIDENT_LOG 2>&1 || echo "Database connection FAILED" | tee -a $INCIDENT_LOG

# Check recent errors
echo "Recent Errors:" | tee -a $INCIDENT_LOG
tail -100 /var/log/application.log | grep -i error >> $INCIDENT_LOG 2>&1

# Check system resources
echo "System Resources:" | tee -a $INCIDENT_LOG
free -h >> $INCIDENT_LOG
df -h >> $INCIDENT_LOG
uptime >> $INCIDENT_LOG

# Step 3: Implement immediate mitigation
echo "" | tee -a $INCIDENT_LOG
echo "Step 3: Implementing mitigation" | tee -a $INCIDENT_LOG

case "$1" in
  "high_error_rate")
    echo "Mitigating high error rate - restarting application services" | tee -a $INCIDENT_LOG
    sudo systemctl restart my-family-clinic
    ;;
  "database_down")
    echo "Database connection issue - checking database service" | tee -a $INCIDENT_LOG
    sudo systemctl status postgresql
    sudo systemctl restart postgresql
    ;;
  "high_memory")
    echo "High memory usage - clearing caches and restarting services" | tee -a $INCIDENT_LOG
    sudo sync && sudo echo 3 > /proc/sys/vm/drop_caches
    sudo systemctl restart my-family-clinic
    ;;
  *)
    echo "Unknown incident type - manual intervention required" | tee -a $INCIDENT_LOG
    ;;
esac

# Step 4: Monitor recovery
echo "" | tee -a $INCIDENT_LOG
echo "Step 4: Monitoring recovery" | tee -a $INCIDENT_LOG
sleep 30

# Verify application is responding
if curl -f -s https://production-url.com/health > /dev/null; then
    echo "✅ Application is responding normally" | tee -a $INCIDENT_LOG
    echo "INCIDENT RESOLVED: $INCIDENT_ID" | tee -a $INCIDENT_LOG
    send_alert "RESOLVED: Incident $INCIDENT_ID has been mitigated successfully."
else
    echo "❌ Application still not responding" | tee -a $INCIDENT_LOG
    echo "ESCALATION REQUIRED: $INCIDENT_ID" | tee -a $INCIDENT_LOG
    send_alert "ESCALATION: Incident $INCIDENT_ID requires additional intervention."
fi

echo "=== INCIDENT RESPONSE COMPLETE ===" | tee -a $INCIDENT_LOG
```

#### Disaster Recovery Procedures
```bash
#!/bin/bash
# Disaster recovery procedures

echo "=== DISASTER RECOVERY INITIATED ==="
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/disaster-recovery/${TIMESTAMP}"

# Step 1: Assess damage and prioritize recovery
echo "Step 1: Damage assessment"
echo "1.1 Identify affected systems"
echo "1.2 Prioritize recovery by business impact"
echo "1.3 Notify stakeholders"

# Step 2: Activate backup systems
echo "Step 2: Activating backup systems"

# Switch to read replica
echo "2.1 Activating database read replica"
# This would involve DNS changes or load balancer updates

# Activate backup application servers
echo "2.2 Activating backup application servers"
# Scale up backup instances

# Step 3: Data recovery procedures
echo "Step 3: Data recovery"

# Restore from latest backup
echo "3.1 Restoring database from backup"
# Example restore command (adjust paths as needed)
# pg_restore -h backup-host -U admin -d myfamilyclinic /backup/latest.dump

# Restore application files
echo "3.2 Restoring application files"
# rsync or similar tool to restore application code

# Step 4: Service restoration
echo "Step 4: Service restoration"

# Start services in correct order
echo "4.1 Starting database services"
sudo systemctl start postgresql

echo "4.2 Starting application services"
sudo systemctl start my-family-clinic

echo "4.3 Starting monitoring services"
sudo systemctl start monitoring

# Step 5: Verification and testing
echo "Step 5: Service verification"

# Test critical functionality
echo "5.1 Testing critical user paths"
curl -f -s https://production-url.com/api/health > /dev/null || echo "Health check failed"

echo "5.2 Testing database connectivity"
psql -h localhost -U app_user -d myfamilyclinic -c "SELECT 1;" > /dev/null || echo "Database test failed"

echo "5.3 Testing API endpoints"
curl -f -s https://production-url.com/api/clinics/search?q=test > /dev/null || echo "API test failed"

echo "=== DISASTER RECOVERY COMPLETE ==="
```

### Business Continuity

#### Backup Verification Procedures
```sql
-- Weekly backup verification procedures

-- Test database backup integrity
SELECT 
    backup_date,
    backup_size,
    backup_duration,
    CASE 
        WHEN backup_status = 'SUCCESS' THEN 'VERIFIED'
        WHEN backup_status = 'FAILED' THEN 'FAILED'
        ELSE 'PENDING_VERIFICATION'
    END as verification_status
FROM backup_log
WHERE backup_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY backup_date DESC;

-- Check backup file sizes for anomalies
WITH backup_sizes AS (
    SELECT 
        backup_date,
        backup_size,
        AVG(backup_size) OVER (ORDER BY backup_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as avg_size
    FROM backup_log
    WHERE backup_date >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
    backup_date,
    backup_size,
    avg_size,
    ABS(backup_size - avg_size) / avg_size * 100 as deviation_percent
FROM backup_sizes
WHERE ABS(backup_size - avg_size) / avg_size > 0.5  -- 50% deviation
ORDER BY deviation_percent DESC;

-- Verify backup retention policy compliance
SELECT 
    backup_type,
    backup_date,
    CURRENT_DATE - backup_date as days_old,
    CASE 
        WHEN backup_type = 'DAILY' AND days_old > 30 THEN 'EXPIRED'
        WHEN backup_type = 'WEEKLY' AND days_old > 90 THEN 'EXPIRED'
        WHEN backup_type = 'MONTHLY' AND days_old > 365 THEN 'EXPIRED'
        ELSE 'COMPLIANT'
    END as retention_status
FROM backup_log
WHERE backup_date < CURRENT_DATE - INTERVAL '7 days';
```

## Troubleshooting Guide

### Common Issues & Solutions

#### Application Performance Issues
```bash
# Performance troubleshooting script

echo "=== Performance Troubleshooting ==="

# 1. Check current system load
echo "System Load:"
uptime

# 2. Check memory usage
echo "Memory Usage:"
free -h

# 3. Check disk usage
echo "Disk Usage:"
df -h

# 4. Check network connectivity
echo "Network Connectivity:"
ping -c 3 google.com

# 5. Check application processes
echo "Application Processes:"
ps aux | grep -E "(node|next|pm2)" | grep -v grep

# 6. Check database connections
echo "Database Connections:"
psql -c "
SELECT 
    count(*) as active_connections,
    state,
    count(*) 
FROM pg_stat_activity 
GROUP BY state;
"

# 7. Check slow queries
echo "Slow Queries:"
psql -c "
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"

# 8. Check application logs for errors
echo "Recent Errors:"
tail -100 /var/log/application.log | grep -i error | tail -20
```

#### Database Connection Issues
```sql
-- Database connection troubleshooting

-- Check current connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;

-- Check for connection leaks
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    EXTRACT(EPOCH FROM (NOW() - query_start)) as duration_seconds
FROM pg_stat_activity
WHERE state = 'idle in transaction'
AND query_start < NOW() - INTERVAL '10 minutes'
ORDER BY duration_seconds DESC;

-- Check connection limits
SELECT 
    setting,
    unit,
    category
FROM pg_settings
WHERE setting LIKE '%connection%'
OR setting LIKE '%max_connections%';

-- Check database size
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) as size
FROM pg_database
WHERE datname = current_database();

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

#### Authentication Issues
```typescript
// Authentication troubleshooting

// Check NextAuth configuration
const authConfig = {
  // Verify environment variables
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  
  // Check provider configuration
  providers: [
    // Verify each provider configuration
  ],
  
  // Check database configuration
  adapter: PrismaAdapter(prisma),
  
  // Check session configuration
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// Test authentication flow
async function testAuth() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection OK");
    
    // Test user creation
    const testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
      },
    });
    console.log("✅ User creation OK");
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log("✅ Test cleanup OK");
    
  } catch (error) {
    console.error("❌ Authentication test failed:", error);
  }
}
```

### Emergency Contacts

#### Escalation Matrix
```
Critical Issues (System Down):
├── Immediate: DevOps Lead (+65-9XXX-XXXX)
├── 15 minutes: CTO (+65-9XXX-XXXX)
├── 30 minutes: Executive Team
└── 1 hour: External Vendors (Supabase, Vercel Support)

High Priority Issues (Performance Degraded):
├── Immediate: On-call Engineer
├── 1 hour: Development Team Lead
├── 2 hours: Engineering Manager
└── 4 hours: CTO

Medium Priority Issues (Feature Broken):
├── 2 hours: Development Team Lead
├── 4 hours: Product Manager
└── Next business day: CTO

Low Priority Issues (Minor Bugs):
├── Next business day: Development Team Lead
├── 2 business days: Product Manager
└── Weekly Sprint Review: Stakeholder
```

#### External Support Contacts
- **Supabase Support**: support@supabase.com
- **Vercel Support**: support@vercel.com  
- **Google Maps API**: Google Cloud Support
- **DNS Provider**: [Support Contact]
- **SSL Certificate Authority**: [Support Contact]

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-05  
**Review Cycle**: Quarterly  
**Document Owner**: DevOps Team Lead  
**Emergency Contact**: DevOps Lead (+65-9XXX-XXXX)