-- Analytics & Performance Optimization Database Migration
-- Sub-Phase 9.8: Analytics & Performance Optimization

-- Create analytics-related enums
CREATE TYPE "ContactEventType" AS ENUM (
  'FORM_VIEW',
  'FORM_START',
  'FORM_FIELD_FOCUS',
  'FORM_FIELD_BLUR',
  'FORM_FIELD_ERROR',
  'FORM_SUBMIT',
  'FORM_COMPLETE',
  'FORM_ABANDON',
  'ENQUIRY_VIEW',
  'ENQUIRY_RESPONSE_VIEW',
  'ENQUIRY_RATING',
  'ENQUIRY_FEEDBACK',
  'PAGE_VIEW',
  'PAGE_EXIT',
  'SEARCH_PERFORMED',
  'CLINIC_VIEW',
  'DOCTOR_VIEW',
  'SLOW_LOAD',
  'JS_ERROR',
  'NETWORK_ERROR',
  'PERFORMANCE_ALERT'
);

CREATE TYPE "StaffingPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ABTestStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED');
CREATE TYPE "InsightImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "InsightPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "InsightStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'IMPLEMENTED', 'DISMISSED', 'REJECTED');

-- Analytics Events Table
CREATE TABLE "contact_analytics_events" (
  "id" TEXT NOT NULL,
  "eventType" "ContactEventType" NOT NULL,
  "eventName" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT,
  "formId" TEXT,
  "enquiryId" TEXT,
  "clinicId" TEXT,
  "pageUrl" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "performanceMetrics" JSONB NOT NULL,
  "userAgent" TEXT NOT NULL,
  "deviceInfo" JSONB NOT NULL,
  "location" JSONB NOT NULL,
  "country" TEXT,
  "region" TEXT,
  "city" TEXT,
  "loadTime" INTEGER,
  "renderTime" INTEGER,
  "interactionTime" INTEGER,
  "formStartTime" TIMESTAMP(3),
  "formCompleteTime" TIMESTAMP(3),
  "totalFormTime" INTEGER,
  "abandonTime" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "contact_analytics_events_pkey" PRIMARY KEY ("id")
);

-- Performance Metrics Aggregate
CREATE TABLE "performance_metrics_aggregate" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "metricName" TEXT NOT NULL,
  "metricValue" DOUBLE PRECISION NOT NULL,
  "percentile" DOUBLE PRECISION,
  "period" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "performance_metrics_aggregate_pkey" PRIMARY KEY ("id")
);

-- Customer Satisfaction Survey
CREATE TABLE "customer_satisfaction_surveys" (
  "id" TEXT NOT NULL,
  "enquiryId" TEXT NOT NULL,
  "responseId" TEXT,
  "overallCSAT" INTEGER NOT NULL,
  "responseTimeCSAT" INTEGER,
  "resolutionCSAT" INTEGER,
  "communicationCSAT" INTEGER,
  "npsScore" INTEGER,
  "cesScore" DOUBLE PRECISION,
  "feedback" TEXT,
  "suggestions" TEXT,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "invitationSent" TIMESTAMP(3),
  "invitationType" TEXT,
  "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
  "followUpLevel" INTEGER,

  CONSTRAINT "customer_satisfaction_surveys_pkey" PRIMARY KEY ("id")
);

-- Form Analytics
CREATE TABLE "form_analytics" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "formName" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "totalViews" INTEGER NOT NULL DEFAULT 0,
  "totalStarts" INTEGER NOT NULL DEFAULT 0,
  "totalCompletions" INTEGER NOT NULL DEFAULT 0,
  "totalAbandons" INTEGER NOT NULL DEFAULT 0,
  "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "abandonmentRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "averageTimeToComplete" INTEGER,
  "averageTimeToAbandon" INTEGER,
  "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "mobileViews" INTEGER NOT NULL DEFAULT 0,
  "mobileCompletionRate" DOUBLE PRECISION,
  "tabletViews" INTEGER NOT NULL DEFAULT 0,
  "tabletCompletionRate" DOUBLE PRECISION,
  "desktopViews" INTEGER NOT NULL DEFAULT 0,
  "desktopCompletionRate" DOUBLE PRECISION,
  "morningViews" INTEGER NOT NULL DEFAULT 0,
  "morningCompletionRate" DOUBLE PRECISION,
  "afternoonViews" INTEGER NOT NULL DEFAULT 0,
  "afternoonCompletionRate" DOUBLE PRECISION,
  "eveningViews" INTEGER NOT NULL DEFAULT 0,
  "eveningCompletionRate" DOUBLE PRECISION,
  "nightViews" INTEGER NOT NULL DEFAULT 0,
  "nightCompletionRate" DOUBLE PRECISION,
  "totalErrors" INTEGER NOT NULL DEFAULT 0,
  "uniqueErrorTypes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "form_analytics_pkey" PRIMARY KEY ("id")
);

-- Field Analytics
CREATE TABLE "field_analytics" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "fieldId" TEXT NOT NULL,
  "fieldName" TEXT NOT NULL,
  "fieldType" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "totalInteractions" INTEGER NOT NULL DEFAULT 0,
  "totalAbandons" INTEGER NOT NULL DEFAULT 0,
  "abandonmentRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "averageTimeSpent" INTEGER,
  "totalErrors" INTEGER NOT NULL DEFAULT 0,
  "errorTypes" JSONB NOT NULL DEFAULT '{}',
  "focusTime" INTEGER,
  "blurCount" INTEGER,
  "correctionCount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "field_analytics_pkey" PRIMARY KEY ("id")
);

-- Enquiry Volume Forecast
CREATE TABLE "enquiry_volume_forecast" (
  "id" TEXT NOT NULL,
  "clinicId" TEXT NOT NULL,
  "forecastDate" TIMESTAMP(3) NOT NULL,
  "predictedVolume" INTEGER NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "lowerBound" INTEGER NOT NULL,
  "upperBound" INTEGER NOT NULL,
  "actualVolume" INTEGER,
  "accuracy" DOUBLE PRECISION,
  "modelVersion" TEXT NOT NULL,
  "features" JSONB NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "enquiry_volume_forecast_pkey" PRIMARY KEY ("id")
);

-- Staffing Recommendations
CREATE TABLE "staffing_recommendations" (
  "id" TEXT NOT NULL,
  "clinicId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "timeSlot" TEXT NOT NULL,
  "recommendedStaff" INTEGER NOT NULL,
  "expectedEnquiries" INTEGER NOT NULL,
  "expectedResponseTime" INTEGER NOT NULL,
  "currentCapacity" INTEGER NOT NULL,
  "utilization" DOUBLE PRECISION NOT NULL,
  "priority" "StaffingPriority" NOT NULL,
  "reasoning" TEXT NOT NULL,
  "modelVersion" TEXT NOT NULL,
  "features" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "staffing_recommendations_pkey" PRIMARY KEY ("id")
);

-- A/B Tests
CREATE TABLE "ab_tests" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "ABTestStatus" NOT NULL DEFAULT 'RUNNING',
  "hypothesis" TEXT NOT NULL,
  "successMetric" TEXT NOT NULL,
  "minimumSampleSize" INTEGER NOT NULL,
  "confidenceLevel" DOUBLE PRECISION NOT NULL,
  "significanceThreshold" DOUBLE PRECISION NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- A/B Test Variants
CREATE TABLE "ab_test_variants" (
  "id" TEXT NOT NULL,
  "testId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "trafficSplit" DOUBLE PRECISION NOT NULL,
  "isControl" BOOLEAN NOT NULL DEFAULT false,
  "configuration" JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT "ab_test_variants_pkey" PRIMARY KEY ("id")
);

-- A/B Test Results
CREATE TABLE "ab_test_results" (
  "id" TEXT NOT NULL,
  "testId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "pValue" DOUBLE PRECISION NOT NULL,
  "statisticalSignificance" BOOLEAN NOT NULL,
  "sampleSize" INTEGER NOT NULL,
  "period" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ab_test_results_pkey" PRIMARY KEY ("id")
);

-- A/B Test Conversions
CREATE TABLE "ab_test_conversions" (
  "id" TEXT NOT NULL,
  "testId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT,
  "conversionType" TEXT NOT NULL,
  "value" DOUBLE PRECISION,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT "ab_test_conversions_pkey" PRIMARY KEY ("id")
);

-- Google Analytics Config
CREATE TABLE "google_analytics_config" (
  "id" TEXT NOT NULL,
  "trackingId" TEXT NOT NULL,
  "measurementId" TEXT NOT NULL,
  "apiSecret" TEXT NOT NULL,
  "enhancedEcommerce" BOOLEAN NOT NULL DEFAULT false,
  "crossDomainTracking" BOOLEAN NOT NULL DEFAULT false,
  "customDimensions" JSONB NOT NULL DEFAULT '[]',
  "customMetrics" JSONB NOT NULL DEFAULT '[]',
  "eventConfigurations" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "google_analytics_config_pkey" PRIMARY KEY ("id")
);

-- Performance Metrics
CREATE TABLE "performance_metrics" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "metricType" TEXT NOT NULL,
  "pageUrl" TEXT,
  "sessionId" TEXT,
  "userId" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cls" DOUBLE PRECISION,
  "fid" DOUBLE PRECISION,
  "fcp" DOUBLE PRECISION,
  "lcp" DOUBLE PRECISION,
  "ttfb" DOUBLE PRECISION,
  "memoryUsage" DOUBLE PRECISION,
  "cpuUsage" DOUBLE PRECISION,
  "networkLatency" DOUBLE PRECISION,
  "renderTime" DOUBLE PRECISION,

  CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- Analytics Dashboards
CREATE TABLE "analytics_dashboards" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "widgets" JSONB NOT NULL DEFAULT '[]',
  "dashboard_filters" JSONB NOT NULL DEFAULT '[]',
  "refreshInterval" INTEGER NOT NULL DEFAULT 300,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "analytics_dashboards_pkey" PRIMARY KEY ("id")
);

-- Automated Reports
CREATE TABLE "automated_reports" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "reportType" TEXT NOT NULL,
  "schedule" JSONB,
  "recipients" JSONB NOT NULL DEFAULT '[]',
  "template" JSONB NOT NULL DEFAULT '{}',
  "filters" JSONB NOT NULL DEFAULT '[]',
  "format" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastGenerated" TIMESTAMP(3),
  "nextScheduled" TIMESTAMP(3),
  "generatedCount" INTEGER NOT NULL DEFAULT 0,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "automated_reports_pkey" PRIMARY KEY ("id")
);

-- Report Delivery History
CREATE TABLE "report_deliveries" (
  "id" TEXT NOT NULL,
  "reportId" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "status" "DeliveryStatus" NOT NULL,
  "format" TEXT NOT NULL,
  "filePath" TEXT,
  "error" TEXT,
  "sentAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "report_deliveries_pkey" PRIMARY KEY ("id")
);

-- Optimization Insights
CREATE TABLE "optimization_insights" (
  "id" TEXT NOT NULL,
  "insightType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "impact" "InsightImpact" NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL,
  "actionable" BOOLEAN NOT NULL,
  "implementation" TEXT,
  "expectedBenefit" TEXT,
  "priority" "InsightPriority" NOT NULL,
  "status" "InsightStatus" NOT NULL DEFAULT 'OPEN',
  "assignedTo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),

  CONSTRAINT "optimization_insights_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance optimization
CREATE INDEX "idx_analytics_events_type_timestamp" ON "contact_analytics_events"("eventType", "timestamp");
CREATE INDEX "idx_analytics_events_session_timestamp" ON "contact_analytics_events"("sessionId", "timestamp");
CREATE INDEX "idx_analytics_events_user_timestamp" ON "contact_analytics_events"("userId", "timestamp") WHERE "userId" IS NOT NULL;
CREATE INDEX "idx_analytics_events_clinic_timestamp" ON "contact_analytics_events"("clinicId", "timestamp");
CREATE INDEX "idx_analytics_events_page_url" ON "contact_analytics_events"("pageUrl");
CREATE INDEX "idx_analytics_events_timestamp" ON "contact_analytics_events"("timestamp");

CREATE INDEX "idx_performance_metrics_name_timestamp" ON "performance_metrics"("name", "timestamp");
CREATE INDEX "idx_performance_metrics_type_timestamp" ON "performance_metrics"("metricType", "timestamp");
CREATE INDEX "idx_performance_metrics_page_url" ON "performance_metrics"("pageUrl");
CREATE INDEX "idx_performance_metrics_session_timestamp" ON "performance_metrics"("sessionId", "timestamp");

CREATE INDEX "idx_satisfaction_survey_enquiry" ON "customer_satisfaction_surveys"("enquiryId");
CREATE INDEX "idx_satisfaction_survey_completed" ON "customer_satisfaction_surveys"("completedAt");
CREATE INDEX "idx_satisfaction_survey_nps" ON "customer_satisfaction_surveys"("npsScore");

CREATE INDEX "idx_form_analytics_unique" ON "form_analytics"("formId", "period", "periodStart", "periodEnd");
CREATE INDEX "idx_form_analytics_period" ON "form_analytics"("period", "periodStart", "periodEnd");

CREATE INDEX "idx_field_analytics_unique" ON "field_analytics"("formId", "fieldId", "period", "periodStart", "periodEnd");
CREATE INDEX "idx_field_analytics_form_period" ON "field_analytics"("formId", "period", "periodStart", "periodEnd");

CREATE INDEX "idx_forecast_clinic_date" ON "enquiry_volume_forecast"("clinicId", "forecastDate");
CREATE INDEX "idx_forecast_date" ON "enquiry_volume_forecast"("forecastDate");

CREATE INDEX "idx_staffing_clinic_date" ON "staffing_recommendations"("clinicId", "date");
CREATE INDEX "idx_staffing_date" ON "staffing_recommendations"("date");

CREATE INDEX "idx_ab_test_status_dates" ON "ab_tests"("status", "startDate", "endDate") WHERE "status" = 'RUNNING';
CREATE INDEX "idx_ab_test_created_by" ON "ab_tests"("createdBy");
CREATE INDEX "idx_ab_variant_test" ON "ab_test_variants"("testId");
CREATE INDEX "idx_ab_result_unique" ON "ab_test_results"("testId", "variantId", "metric", "period", "periodStart", "periodEnd");
CREATE INDEX "idx_ab_conversion_variant" ON "ab_test_conversions"("testId", "variantId");
CREATE INDEX "idx_ab_conversion_session" ON "ab_test_conversions"("sessionId", "timestamp");
CREATE INDEX "idx_ab_conversion_user" ON "ab_test_conversions"("userId", "timestamp") WHERE "userId" IS NOT NULL;

CREATE INDEX "idx_delivery_report_sent" ON "report_deliveries"("reportId", "sentAt");

CREATE INDEX "idx_insight_type_priority" ON "optimization_insights"("insightType", "priority");
CREATE INDEX "idx_insight_status_created" ON "optimization_insights"("status", "createdAt");

-- Create foreign key constraints
ALTER TABLE "contact_analytics_events" ADD CONSTRAINT "contact_analytics_events_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_analytics_events" ADD CONSTRAINT "contact_analytics_events_form_fkey" FOREIGN KEY ("formId") REFERENCES "ContactForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_analytics_events" ADD CONSTRAINT "contact_analytics_events_enquiry_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_analytics_events" ADD CONSTRAINT "contact_analytics_events_clinic_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "performance_metrics_aggregate" ADD CONSTRAINT "performance_metrics_aggregate_event_fkey" FOREIGN KEY ("eventId") REFERENCES "contact_analytics_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_satisfaction_surveys" ADD CONSTRAINT "customer_satisfaction_surveys_enquiry_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_satisfaction_surveys" ADD CONSTRAINT "customer_satisfaction_surveys_response_fkey" FOREIGN KEY ("responseId") REFERENCES "ContactResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "form_analytics" ADD CONSTRAINT "form_analytics_form_fkey" FOREIGN KEY ("formId") REFERENCES "ContactForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "field_analytics" ADD CONSTRAINT "field_analytics_form_fkey" FOREIGN KEY ("formId") REFERENCES "ContactForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "enquiry_volume_forecast" ADD CONSTRAINT "enquiry_volume_forecast_clinic_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "staffing_recommendations" ADD CONSTRAINT "staffing_recommendations_clinic_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ab_test_variants" ADD CONSTRAINT "ab_test_variants_test_fkey" FOREIGN KEY ("testId") REFERENCES "ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ab_test_results" ADD CONSTRAINT "ab_test_results_test_fkey" FOREIGN KEY ("testId") REFERENCES "ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ab_test_results" ADD CONSTRAINT "ab_test_results_variant_fkey" FOREIGN KEY ("variantId") REFERENCES "ab_test_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ab_test_conversions" ADD CONSTRAINT "ab_test_conversions_variant_fkey" FOREIGN KEY ("variantId") REFERENCES "ab_test_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ab_test_conversions" ADD CONSTRAINT "ab_test_conversions_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create materialized views for faster analytics queries
CREATE MATERIALIZED VIEW "daily_analytics_summary" AS
SELECT 
  DATE("timestamp") as date,
  "clinicId",
  "eventType",
  COUNT(*) as event_count,
  AVG(("performanceMetrics"->>'loadTime')::numeric) as avg_load_time,
  AVG(("performanceMetrics"->>'renderTime')::numeric) as avg_render_time
FROM "contact_analytics_events"
WHERE "timestamp" >= NOW() - INTERVAL '90 days'
GROUP BY DATE("timestamp"), "clinicId", "eventType"
WITH NO DATA;

CREATE UNIQUE INDEX "idx_daily_analytics_unique" ON "daily_analytics_summary" (date, "clinicId", "eventType");

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY "daily_analytics_summary";
END;
$$ LANGUAGE plpgsql;

-- Schedule daily refresh at 2 AM
SELECT cron.schedule('refresh-analytics', '0 2 * * *', 'SELECT refresh_daily_analytics();');

-- Insert default Google Analytics configuration
INSERT INTO "google_analytics_config" (
  "id",
  "trackingId",
  "measurementId",
  "apiSecret",
  "enhancedEcommerce",
  "crossDomainTracking",
  "customDimensions",
  "customMetrics",
  "eventConfigurations",
  "isActive"
) VALUES (
  'default-config',
  'G-XXXXXXXXXX',
  'G-XXXXXXXXXX',
  'your-api-secret-here',
  true,
  false,
  '[
    {"index": 1, "name": "clinic_id", "scope": "session"},
    {"index": 2, "name": "form_type", "scope": "event"},
    {"index": 3, "name": "enquiry_category", "scope": "event"},
    {"index": 4, "name": "device_type", "scope": "session"},
    {"index": 5, "name": "user_segment", "scope": "session"}
  ]'::jsonb,
  '[
    {"index": 1, "name": "form_completion_time", "type": "time"},
    {"index": 2, "name": "page_load_time", "type": "time"},
    {"index": 3, "name": "form_interactions_count", "type": "integer"}
  ]'::jsonb,
  '[]'::jsonb,
  false
) ON CONFLICT ("id") DO NOTHING;

-- Create default analytics dashboard
INSERT INTO "analytics_dashboards" (
  "id",
  "name",
  "description",
  "widgets",
  "dashboard_filters",
  "refreshInterval",
  "isPublic",
  "createdBy"
) VALUES (
  'default-dashboard',
  'Contact System Analytics',
  'Default analytics dashboard for contact system performance',
  '[]'::jsonb,
  '[]'::jsonb,
  300,
  true,
  'system'
) ON CONFLICT ("id") DO NOTHING;

-- Create performance optimization triggers
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON "contact_analytics_events"
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON "form_analytics"
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON "field_analytics"
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON "ab_tests"
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON "analytics_dashboards"
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON "automated_reports"
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

-- Create function to calculate form analytics
CREATE OR REPLACE FUNCTION calculate_form_analytics(
  p_form_id TEXT,
  p_period TEXT,
  p_period_start TIMESTAMP(3),
  p_period_end TIMESTAMP(3)
)
RETURNS TABLE (
  total_views INTEGER,
  total_starts INTEGER,
  total_completions INTEGER,
  total_abandons INTEGER,
  completion_rate DOUBLE PRECISION,
  abandonment_rate DOUBLE PRECISION,
  average_time_to_complete INTEGER,
  average_time_to_abandon INTEGER
) AS $$
DECLARE
  v_total_views INTEGER;
  v_total_starts INTEGER;
  v_total_completions INTEGER;
  v_total_abandons INTEGER;
  v_completion_rate DOUBLE PRECISION;
  v_abandonment_rate DOUBLE PRECISION;
  v_avg_time_complete INTEGER;
  v_avg_time_abandon INTEGER;
BEGIN
  -- Count views
  SELECT COUNT(*) INTO v_total_views
  FROM "contact_analytics_events"
  WHERE "formId" = p_form_id
    AND "eventType" = 'FORM_VIEW'
    AND "timestamp" BETWEEN p_period_start AND p_period_end;
  
  -- Count starts
  SELECT COUNT(*) INTO v_total_starts
  FROM "contact_analytics_events"
  WHERE "formId" = p_form_id
    AND "eventType" = 'FORM_START'
    AND "timestamp" BETWEEN p_period_start AND p_period_end;
  
  -- Count completions
  SELECT COUNT(*) INTO v_total_completions
  FROM "contact_analytics_events"
  WHERE "formId" = p_form_id
    AND "eventType" = 'FORM_COMPLETE'
    AND "timestamp" BETWEEN p_period_start AND p_period_end;
  
  -- Count abandons
  SELECT COUNT(*) INTO v_total_abandons
  FROM "contact_analytics_events"
  WHERE "formId" = p_form_id
    AND "eventType" = 'FORM_ABANDON'
    AND "timestamp" BETWEEN p_period_start AND p_period_end;
  
  -- Calculate rates
  v_completion_rate = CASE 
    WHEN v_total_starts > 0 THEN (v_total_completions::DOUBLE PRECISION / v_total_starts) * 100
    ELSE 0
  END;
  
  v_abandonment_rate = CASE 
    WHEN v_total_starts > 0 THEN (v_total_abandons::DOUBLE PRECISION / v_total_starts) * 100
    ELSE 0
  END;
  
  -- Calculate average times
  SELECT AVG("totalFormTime") INTO v_avg_time_complete
  FROM "contact_analytics_events"
  WHERE "formId" = p_form_id
    AND "eventType" = 'FORM_COMPLETE'
    AND "totalFormTime" IS NOT NULL
    AND "timestamp" BETWEEN p_period_start AND p_period_end;
  
  SELECT AVG("totalFormTime") INTO v_avg_time_abandon
  FROM "contact_analytics_events"
  WHERE "formId" = p_form_id
    AND "eventType" = 'FORM_ABANDON'
    AND "totalFormTime" IS NOT NULL
    AND "timestamp" BETWEEN p_period_start AND p_period_end;
  
  -- Return results
  RETURN QUERY SELECT 
    COALESCE(v_total_views, 0),
    COALESCE(v_total_starts, 0),
    COALESCE(v_total_completions, 0),
    COALESCE(v_total_abandons, 0),
    COALESCE(v_completion_rate, 0),
    COALESCE(v_abandonment_rate, 0),
    COALESCE(v_avg_time_complete, 0),
    COALESCE(v_avg_time_abandon, 0);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
GRANT USAGE ON SCHEMA public TO your_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;