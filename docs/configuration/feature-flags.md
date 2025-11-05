# Feature Flag Management Guide

## Overview

This guide outlines the comprehensive feature flag management system for My Family Clinic, enabling safe rollouts, A/B testing, and controlled deployment of healthcare features while maintaining compliance and user safety.

## Feature Flag Architecture

### Core Components

```typescript
// Feature Flag System Architecture
interface FeatureFlagSystem {
  flagManager: FlagManager;
  targetingEngine: TargetingEngine;
  rolloutController: RolloutController;
  metricsCollector: MetricsCollector;
  complianceValidator: ComplianceValidator;
}

// Configuration Structure
interface FeatureFlagConfig {
  flagId: string;
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
  enabled: boolean;
  targeting: TargetingConfig;
  rollout: RolloutConfig;
  dependencies: string[];
  compliance: ComplianceConfig;
  metrics: MetricsConfig;
}
```

### Database Schema

```sql
-- Feature Flags Table
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  flag_type VARCHAR(50) NOT NULL, -- 'boolean', 'percentage', 'targeted', 'experiment'
  enabled BOOLEAN DEFAULT false,
  environment VARCHAR(20) NOT NULL,
  
  -- Targeting Configuration
  targeting_rules JSONB,
  user_segments TEXT[],
  geo_targeting JSONB,
  device_targeting JSONB,
  
  -- Rollout Configuration
  rollout_percentage INTEGER DEFAULT 0,
  rollout_schedule JSONB,
  gradual_rollout_enabled BOOLEAN DEFAULT false,
  gradual_rollout_steps JSONB,
  
  -- Dependencies and Constraints
  dependencies TEXT[],
  prerequisites JSONB,
  max_active_users INTEGER,
  
  -- Compliance and Safety
  compliance_required BOOLEAN DEFAULT false,
  compliance_frameworks TEXT[], -- ['PDPA', 'MOH', 'HIPAA']
  safety_checks JSONB,
  emergency_kill_switch BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activated_at TIMESTAMP WITH TIME ZONE,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  version INTEGER DEFAULT 1,
  change_log JSONB
);

-- Flag Variations for A/B Testing
CREATE TABLE flag_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  variation_key VARCHAR(50) NOT NULL,
  variation_value JSONB NOT NULL,
  weight INTEGER DEFAULT 0, -- Percentage weight
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Flag Assignments
CREATE TABLE user_flag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  assigned_value JSONB,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  assignment_reason VARCHAR(100)
);

-- Flag Metrics and Performance
CREATE TABLE flag_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'exposure', 'conversion', 'error', 'performance'
  metric_value DECIMAL,
  metric_data JSONB,
  sample_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Flag Categories and Types

### Healthcare Feature Categories

```typescript
// Feature Flag Categories
enum FlagCategory {
  // Core Healthcare Features
  TELEHEALTH = 'telehealth',
  MEDICAL_RECORDS = 'medical_records',
  PRESCRIPTION_MANAGEMENT = 'prescription_management',
  APPOINTMENT_BOOKING = 'appointment_booking',
  
  // User Experience
  NEW_UI = 'new_ui',
  MOBILE_OPTIMIZATION = 'mobile_optimization',
  ACCESSIBILITY_FEATURES = 'accessibility_features',
  MULTILANGUAGE = 'multilanguage',
  
  // Analytics and Insights
  ANALYTICS_TRACKING = 'analytics_tracking',
  PERFORMANCE_MONITORING = 'performance_monitoring',
  USER_BEHAVIOR_ANALYSIS = 'user_behavior_analysis',
  
  // Integrations
  THIRD_PARTY_INTEGRATIONS = 'third_party_integrations',
  API_FEATURES = 'api_features',
  WEBHOOK_NOTIFICATIONS = 'webhook_notifications',
  
  // Compliance and Security
  ENHANCED_SECURITY = 'enhanced_security',
  COMPLIANCE_FEATURES = 'compliance_features',
  AUDIT_LOGGING = 'audit_logging',
  
  // Experimental Features
  AI_ASSISTANT = 'ai_assistant',
  PREDICTIVE_ANALYTICS = 'predictive_analytics',
  BLOCKCHAIN_VERIFICATION = 'blockchain_verification'
}

// Flag Types
enum FlagType {
  BOOLEAN = 'boolean',              // Simple on/off
  PERCENTAGE = 'percentage',        // Gradual rollout by percentage
  TARGETED = 'targeted',           // Specific user groups
  EXPERIMENT = 'experiment',        // A/B testing
  GRADUAL = 'gradual'              // Time-based rollout
}
```

### Healthcare-Specific Flag Definitions

```typescript
// Healthcare Feature Flags Configuration
export const HEALTHCARE_FEATURE_FLAGS = {
  // Telehealth Features
  telehealthEnabled: {
    category: FlagCategory.TELEHEALTH,
    type: FlagType.BOOLEAN,
    defaultValue: false,
    description: 'Enable telemedicine appointments',
    compliance: {
      requiresPdpaConsent: true,
      requiresMohApproval: true,
      dataClassification: 'sensitive',
      auditRequired: true
    },
    dependencies: ['video_conferencing', 'secure_messaging'],
    killSwitch: true,
    rolloutStrategy: 'clinic_approval'
  },
  
  // Medical Records Features
  enhancedMedicalRecords: {
    category: FlagCategory.MEDICAL_RECORDS,
    type: FlagType.PERCENTAGE,
    defaultValue: 0,
    description: 'Enhanced medical record interface',
    gradualRollout: {
      initialPercentage: 5,
      incrementPercentage: 10,
      incrementInterval: '1day',
      maxPercentage: 100
    },
    targeting: {
      userTypes: ['healthcare_provider', 'patient'],
      clinicTypes: ['private_clinic', 'hospital'],
      licenseRequired: true
    },
    compliance: {
      requiresPdpaConsent: true,
      mohValidationRequired: true,
      dataRetentionPolicy: 'extended'
    }
  },
  
  // AI Features (Experimental)
  aiAssistant: {
    category: FlagCategory.AI_ASSISTANT,
    type: FlagType.EXPERIMENT,
    defaultValue: false,
    description: 'AI-powered healthcare assistant',
    experimentConfig: {
      variants: [
        { key: 'control', weight: 50, description: 'No AI assistant' },
        { key: 'ai_assistant_basic', weight: 25, description: 'Basic AI features' },
        { key: 'ai_assistant_advanced', weight: 25, description: 'Advanced AI features' }
      ],
      conversionMetrics: ['user_engagement', 'query_resolution', 'satisfaction_score'],
      minSampleSize: 1000,
      maxDuration: '30days'
    },
    safetyChecks: {
      medicalAdviceValidation: true,
      disclaimerRequired: true,
      humanOversight: true
    },
    compliance: {
      requiresExplicitConsent: true,
      dataProcessingAgreement: true,
      transparencyReport: true
    }
  }
} as const;
```

## Feature Flag Management System

### Flag Manager Service

```typescript
// services/feature-flags/flag-manager.ts
export class FeatureFlagManager {
  private readonly redis: Redis;
  private readonly database: Database;
  private readonly auditLogger: AuditLogger;
  
  async evaluateFlag(flagKey: string, userId: string, context: UserContext): Promise<FlagEvaluation> {
    const flag = await this.getFlag(flagKey);
    if (!flag) {
      return { enabled: false, value: null };
    }
    
    try {
      // Check if flag is globally enabled
      if (!flag.enabled) {
        return { enabled: false, value: flag.default_value };
      }
      
      // Evaluate targeting rules
      const targetingResult = await this.evaluateTargeting(flag, userId, context);
      if (!targetingResult.targeted) {
        return { enabled: false, value: flag.default_value };
      }
      
      // Evaluate rollout rules
      const rolloutResult = await this.evaluateRollout(flag, userId, context);
      
      // Log flag evaluation
      await this.logFlagEvaluation(flagKey, userId, rolloutResult.enabled);
      
      return {
        enabled: rolloutResult.enabled,
        value: rolloutResult.value,
        variation: rolloutResult.variation,
        reason: rolloutResult.reason
      };
      
    } catch (error) {
      await this.auditLogger.logError('flag_evaluation_failed', {
        flagKey,
        userId,
        error: error.message
      });
      
      // Fail-safe: disable flag if evaluation fails
      return { enabled: false, value: flag.default_value, reason: 'evaluation_error' };
    }
  }
  
  async createFlag(flagConfig: CreateFlagRequest): Promise<FeatureFlag> {
    // Validate flag configuration
    await this.validateFlagConfig(flagConfig);
    
    // Check compliance requirements
    await this.validateComplianceRequirements(flagConfig);
    
    // Create flag in database
    const flag = await this.database.featureFlags.create({
      data: {
        ...flagConfig,
        id: uuid(),
        created_by: this.getCurrentUserId(),
        created_at: new Date()
      }
    });
    
    // Cache flag configuration
    await this.cacheFlag(flag);
    
    // Audit log
    await this.auditLogger.logAction('flag_created', {
      flagId: flag.id,
      flagKey: flag.flag_key,
      createdBy: this.getCurrentUserId()
    });
    
    return flag;
  }
  
  private async validateFlagConfig(config: CreateFlagRequest): Promise<void> {
    if (config.rollout_percentage < 0 || config.rollout_percentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }
    
    if (config.flag_type === FlagType.EXPERIMENT && !config.variations) {
      throw new Error('Experiment flags must have variations defined');
    }
    
    if (config.dependencies) {
      for (const dependency of config.dependencies) {
        const depFlag = await this.getFlag(dependency);
        if (!depFlag) {
          throw new Error(`Dependency flag '${dependency}' does not exist`);
        }
      }
    }
  }
}
```

### Targeting Engine

```typescript
// services/feature-flags/targeting-engine.ts
export class TargetingEngine {
  async evaluateTargeting(flag: FeatureFlag, userId: string, context: UserContext): Promise<TargetingResult> {
    const targetingRules = flag.targeting_rules;
    
    // Evaluate user segments
    if (targetingRules.user_segments?.length) {
      const userSegments = await this.getUserSegments(userId);
      const hasMatchingSegment = targetingRules.user_segments.some(segment => 
        userSegments.includes(segment)
      );
      
      if (!hasMatchingSegment) {
        return { targeted: false, reason: 'user_segment_not_matched' };
      }
    }
    
    // Evaluate geographic targeting
    if (targetingRules.geo_targeting) {
      const geoMatch = await this.evaluateGeoTargeting(targetingRules.geo_targeting, context.location);
      if (!geoMatch.matched) {
        return { targeted: false, reason: 'geo_target_not_matched' };
      }
    }
    
    // Evaluate device targeting
    if (targetingRules.device_targeting) {
      const deviceMatch = await this.evaluateDeviceTargeting(targetingRules.device_targeting, context.device);
      if (!deviceMatch.matched) {
        return { targeted: false, reason: 'device_target_not_matched' };
      }
    }
    
    // Evaluate clinic-specific targeting
    if (targetingRules.clinic_targeting) {
      const clinicMatch = await this.evaluateClinicTargeting(targetingRules.clinic_targeting, context.clinicId);
      if (!clinicMatch.matched) {
        return { targeted: false, reason: 'clinic_target_not_matched' };
      }
    }
    
    // Evaluate user attributes
    if (targetingRules.user_attributes) {
      const userMatch = await this.evaluateUserAttributes(targetingRules.user_attributes, context.user);
      if (!userMatch.matched) {
        return { targeted: false, reason: 'user_attribute_not_matched' };
      }
    }
    
    return { targeted: true, matchedRules: targetingRules };
  }
  
  private async evaluateClinicTargeting(targeting: any, clinicId: string): Promise<MatchResult> {
    if (targeting.clinicIds?.length) {
      if (!targeting.clinicIds.includes(clinicId)) {
        return { matched: false };
      }
    }
    
    if (targeting.clinicTypes?.length) {
      const clinic = await this.getClinic(clinicId);
      if (!clinic || !targeting.clinicTypes.includes(clinic.type)) {
        return { matched: false };
      }
    }
    
    if (targeting.clinicSize) {
      const clinic = await this.getClinic(clinicId);
      if (!clinic || !this.matchesSizeCriteria(clinic.size, targeting.clinicSize)) {
        return { matched: false };
      }
    }
    
    return { matched: true };
  }
}
```

### Rollout Controller

```typescript
// services/feature-flags/rollout-controller.ts
export class RolloutController {
  async evaluateRollout(flag: FeatureFlag, userId: string, context: UserContext): Promise<RolloutResult> {
    const rolloutConfig = flag.rollout_config;
    
    switch (flag.flag_type) {
      case FlagType.BOOLEAN:
        return this.evaluateBooleanRollout(flag);
        
      case FlagType.PERCENTAGE:
        return this.evaluatePercentageRollout(flag, userId);
        
      case FlagType.GRADUAL:
        return this.evaluateGradualRollout(flag, userId, context);
        
      case FlagType.EXPERIMENT:
        return this.evaluateExperimentRollout(flag, userId, context);
        
      default:
        return { enabled: false, reason: 'unknown_rollout_type' };
    }
  }
  
  private async evaluateGradualRollout(flag: FeatureFlag, userId: string, context: UserContext): Promise<RolloutResult> {
    const schedule = flag.rollout_schedule;
    const now = new Date();
    
    // Check if rollout has started
    if (now < new Date(schedule.start_date)) {
      return { enabled: false, reason: 'rollout_not_started' };
    }
    
    // Check if rollout is complete
    if (now > new Date(schedule.end_date)) {
      return { enabled: schedule.auto_enable_at_end, reason: 'rollout_completed' };
    }
    
    // Calculate current rollout percentage based on time
    const totalDuration = new Date(schedule.end_date).getTime() - new Date(schedule.start_date).getTime();
    const elapsed = now.getTime() - new Date(schedule.start_date).getTime();
    const progressPercentage = Math.min((elapsed / totalDuration) * 100, 100);
    
    // Check if user falls within current rollout percentage
    const userHash = this.hashUserId(userId);
    const userPercentage = (userHash % 100) + 1;
    
    if (userPercentage <= progressPercentage) {
      return {
        enabled: true,
        reason: 'gradual_rollout',
        rollout_percentage: progressPercentage
      };
    }
    
    return {
      enabled: false,
      reason: 'not_in_rollout_percentage',
      rollout_percentage: progressPercentage
    };
  }
  
  private async evaluateExperimentRollout(flag: FeatureFlag, userId: string, context: UserContext): Promise<RolloutResult> {
    // Check if user is already assigned to a variant
    const existingAssignment = await this.getUserAssignment(flag.id, userId);
    if (existingAssignment) {
      return {
        enabled: true,
        variation: existingAssignment.variation_key,
        reason: 'existing_assignment'
      };
    }
    
    // Create new assignment based on weighted randomization
    const variation = await this.assignUserToVariation(flag, userId);
    
    // Store assignment
    await this.assignUserToVariation(flag, userId, variation.key);
    
    return {
      enabled: true,
      variation: variation.key,
      value: variation.value,
      reason: 'new_assignment'
    };
  }
}
```

## Healthcare Compliance for Feature Flags

### Compliance Validation

```typescript
// services/feature-flags/compliance-validator.ts
export class FeatureFlagComplianceValidator {
  async validateFlagCompliance(flag: FeatureFlag): Promise<ComplianceValidation> {
    const validation: ComplianceValidation = {
      compliant: true,
      issues: [],
      warnings: [],
      recommendations: []
    };
    
    // PDPA Compliance Check
    const pdpaValidation = await this.validatePdpaCompliance(flag);
    if (!pdpaValidation.compliant) {
      validation.compliant = false;
      validation.issues.push(...pdpaValidation.issues);
    }
    
    // MOH Compliance Check
    const mohValidation = await this.validateMohCompliance(flag);
    if (!mohValidation.compliant) {
      validation.compliant = false;
      validation.issues.push(...mohValidation.issues);
    }
    
    // Healthcare Data Classification
    const classificationValidation = await this.validateDataClassification(flag);
    if (classificationValidation.requiresEnhancement) {
      validation.warnings.push(...classificationValidation.warnings);
    }
    
    return validation;
  }
  
  private async validatePdpaCompliance(flag: FeatureFlag): Promise<ComplianceValidation> {
    const issues: ComplianceIssue[] = [];
    
    // Check if flag involves personal data processing
    if (flag.processes_personal_data) {
      // Verify consent mechanism exists
      if (!flag.consent_mechanism) {
        issues.push({
          type: 'critical',
          framework: 'PDPA',
          issue: 'Personal data processing without consent mechanism',
          flagKey: flag.flag_key
        });
      }
      
      // Check data retention compliance
      if (flag.data_retention > 2555) { // 7 years max
        issues.push({
          type: 'warning',
          framework: 'PDPA',
          issue: 'Data retention exceeds PDPA maximum (7 years)',
          flagKey: flag.flag_key
        });
      }
      
      // Verify purpose limitation
      if (!flag.purpose_statement) {
        issues.push({
          type: 'critical',
          framework: 'PDPA',
          issue: 'No purpose statement for personal data processing',
          flagKey: flag.flag_key
        });
      }
    }
    
    return {
      compliant: issues.filter(i => i.type === 'critical').length === 0,
      issues
    };
  }
  
  private async validateMohCompliance(flag: FeatureFlag): Promise<ComplianceValidation> {
    const issues: ComplianceIssue[] = [];
    
    // Check if flag involves healthcare provider features
    if (flag.category === FlagCategory.TELEHEALTH || flag.category === FlagCategory.MEDICAL_RECORDS) {
      // Verify MOH license validation
      if (!flag.moh_validation_required) {
        issues.push({
          type: 'critical',
          framework: 'MOH',
          issue: 'Healthcare feature without MOH validation requirement',
          flagKey: flag.flag_key
        });
      }
      
      // Check audit logging requirement
      if (!flag.audit_logging_enabled) {
        issues.push({
          type: 'critical',
          framework: 'MOH',
          issue: 'Healthcare feature without audit logging',
          flagKey: flag.flag_key
        });
      }
      
      // Verify emergency kill switch
      if (!flag.emergency_kill_switch) {
        issues.push({
          type: 'warning',
          framework: 'MOH',
          issue: 'Healthcare feature without emergency kill switch',
          flagKey: flag.flag_key
        });
      }
    }
    
    return {
      compliant: issues.filter(i => i.type === 'critical').length === 0,
      issues
    };
  }
}
```

### Safety Mechanisms

```typescript
// services/feature-flags/safety-mechanisms.ts
export class FeatureFlagSafetyController {
  private readonly monitoringService: MonitoringService;
  private readonly alertService: AlertService;
  
  async monitorFlagHealth(flagId: string): Promise<HealthStatus> {
    const flag = await this.getFlag(flagId);
    const metrics = await this.getFlagMetrics(flagId);
    
    const healthChecks = await Promise.all([
      this.checkErrorRate(flag, metrics),
      this.checkPerformanceImpact(flag, metrics),
      this.checkUserSatisfaction(flag, metrics),
      this.checkComplianceStatus(flag),
      this.checkDependencyHealth(flag)
    ]);
    
    const overallHealth = this.calculateOverallHealth(healthChecks);
    
    if (overallHealth.status === 'unhealthy') {
      await this.triggerSafetyMechanisms(flag, overallHealth);
    }
    
    return overallHealth;
  }
  
  private async triggerSafetyMechanisms(flag: FeatureFlag, healthStatus: HealthStatus): Promise<void> {
    // Immediate alerts
    await this.alertService.sendAlert({
      type: 'critical',
      title: `Feature Flag Health Issue: ${flag.name}`,
      details: healthStatus,
      recipients: ['engineering-team', 'healthcare-compliance']
    });
    
    // Gradual rollback if applicable
    if (flag.allow_rollback) {
      await this.initiateGradualRollback(flag);
    }
    
    // Emergency kill switch
    if (healthStatus.severity === 'critical' && flag.emergency_kill_switch) {
      await this.triggerEmergencyKillSwitch(flag);
    }
    
    // Create incident
    await this.createIncident({
      type: 'feature_flag_health_issue',
      flagId: flag.id,
      severity: healthStatus.severity,
      status: 'investigating'
    });
  }
  
  private async checkErrorRate(flag: FeatureFlag, metrics: FlagMetrics): Promise<HealthCheck> {
    const errorRate = metrics.errors / metrics.total_requests;
    const threshold = 0.01; // 1% error rate threshold
    
    if (errorRate > threshold) {
      return {
        status: 'unhealthy',
        severity: 'high',
        issue: `Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${(threshold * 100).toFixed(2)}%)`,
        recommendation: 'Investigate error sources and consider rollback'
      };
    }
    
    return {
      status: 'healthy',
      issue: null
    };
  }
}
```

## A/B Testing and Experimentation

### Experiment Management

```typescript
// services/experiments/experiment-manager.ts
export class ExperimentManager {
  async createExperiment(config: ExperimentConfig): Promise<Experiment> {
    // Validate experiment configuration
    await this.validateExperimentConfig(config);
    
    // Create feature flag for experiment
    const flag = await this.flagManager.createFlag({
      flag_key: `experiment_${config.id}`,
      name: config.name,
      description: config.description,
      flag_type: FlagType.EXPERIMENT,
      enabled: false, // Start disabled
      variations: config.variations,
      experiment_config: {
        primary_metric: config.primaryMetric,
        secondary_metrics: config.secondaryMetrics,
        min_sample_size: config.minSampleSize,
        confidence_level: config.confidenceLevel,
        max_duration: config.maxDuration
      }
    });
    
    // Setup experiment tracking
    await this.setupExperimentTracking(config, flag);
    
    // Configure safety monitoring
    await this.setupSafetyMonitoring(config, flag);
    
    return flag;
  }
  
  async startExperiment(experimentId: string): Promise<void> {
    const experiment = await this.getExperiment(experimentId);
    
    // Pre-launch checks
    const preLaunchChecks = await this.runPreLaunchChecks(experiment);
    if (!preLaunchChecks.allPassed) {
      throw new Error(`Pre-launch checks failed: ${preLaunchChecks.failedChecks.join(', ')}`);
    }
    
    // Start the experiment
    await this.flagManager.updateFlag(experiment.flag_id, { enabled: true });
    
    // Notify stakeholders
    await this.notificationService.sendExperimentStartNotification(experiment);
    
    // Start monitoring
    await this.monitoringService.startExperimentMonitoring(experimentId);
  }
  
  async analyzeExperiment(experimentId: string): Promise<ExperimentAnalysis> {
    const experiment = await this.getExperiment(experimentId);
    const metrics = await this.collectExperimentMetrics(experimentId);
    
    // Statistical analysis
    const analysis = await this.performStatisticalAnalysis(metrics, experiment.config);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis);
    
    // Check for early stopping criteria
    const earlyStopping = this.checkEarlyStopping(analysis, experiment.config);
    
    return {
      experimentId,
      status: earlyStopping.shouldStop ? 'stopped' : 'ongoing',
      results: analysis,
      recommendations,
      earlyStopping,
      nextReviewDate: this.calculateNextReviewDate()
    };
  }
}
```

### Healthcare-Specific Experiment Considerations

```typescript
// services/experiments/healthcare-experiments.ts
export class HealthcareExperimentManager {
  async createHealthcareExperiment(config: HealthcareExperimentConfig): Promise<HealthcareExperiment> {
    // Additional validation for healthcare features
    await this.validateHealthcareExperiment(config);
    
    // Ensure PDPA compliance for patient data
    await this.validatePdpaCompliance(config);
    
    // Validate MOH requirements
    await this.validateMohRequirements(config);
    
    // Setup enhanced monitoring for healthcare features
    await this.setupHealthcareMonitoring(config);
    
    // Create experiment with healthcare-specific safeguards
    const experiment = await this.createExperiment({
      ...config,
      safeguards: {
        patientSafetyCheck: true,
        healthcareProviderApproval: true,
        complianceReview: true,
        emergencyStop: true
      }
    });
    
    return experiment;
  }
  
  private async validateHealthcareExperiment(config: HealthcareExperimentConfig): Promise<void> {
    // Check if experiment involves patient data
    if (config.involvesPatientData) {
      // Verify consent mechanism
      if (!config.patientConsentMechanism) {
        throw new Error('Healthcare experiments involving patient data require explicit consent mechanism');
      }
      
      // Verify data anonymization if applicable
      if (config.dataUsage === 'anonymized' && !config.anonymizationMethod) {
        throw new Error('Anonymization method must be specified for anonymized data usage');
      }
    }
    
    // Check provider involvement
    if (config.involvesHealthcareProviders) {
      // Verify provider consent
      if (!config.providerConsent) {
        throw new Error('Provider consent required for experiments involving healthcare providers');
      }
      
      // Verify professional standards compliance
      if (!config.professionalStandardsCompliance) {
        throw new Error('Professional standards compliance verification required');
      }
    }
  }
}
```

## Metrics and Analytics

### Flag Performance Metrics

```typescript
// services/analytics/flag-analytics.ts
export class FlagAnalyticsService {
  async collectFlagMetrics(flagId: string, timeRange: DateRange): Promise<FlagMetrics> {
    const [exposureMetrics, conversionMetrics, errorMetrics, performanceMetrics] = await Promise.all([
      this.collectExposureMetrics(flagId, timeRange),
      this.collectConversionMetrics(flagId, timeRange),
      this.collectErrorMetrics(flagId, timeRange),
      this.collectPerformanceMetrics(flagId, timeRange)
    ]);
    
    return {
      flagId,
      timeRange,
      exposure: exposureMetrics,
      conversion: conversionMetrics,
      errors: errorMetrics,
      performance: performanceMetrics,
      healthcare: await this.collectHealthcareMetrics(flagId, timeRange)
    };
  }
  
  private async collectHealthcareMetrics(flagId: string, timeRange: DateRange): Promise<HealthcareMetrics> {
    const flag = await this.getFlag(flagId);
    
    if (flag.category !== FlagCategory.TELEHEALTH && flag.category !== FlagCategory.MEDICAL_RECORDS) {
      return null;
    }
    
    return {
      patientSafetyIncidents: await this.getPatientSafetyIncidents(flagId, timeRange),
      providerSatisfaction: await this.getProviderSatisfaction(flagId, timeRange),
      complianceViolations: await this.getComplianceViolations(flagId, timeRange),
      clinicalOutcomeImpact: await this.getClinicalOutcomeImpact(flagId, timeRange)
    };
  }
}
```

## Implementation and Deployment

### Deployment Scripts

```bash
#!/bin/bash
# scripts/feature-flags/deploy-flags.sh

echo "🚀 Deploying feature flags to $1 environment"

ENVIRONMENT=$1
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
  echo "❌ Invalid environment. Must be development, staging, or production"
  exit 1
fi

# Load configuration
source "config/environments/$ENVIRONMENT.env"

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."
npm run flags:validate -- --environment=$ENVIRONMENT

if [ $? -ne 0 ]; then
  echo "❌ Pre-deployment checks failed"
  exit 1
fi

# Backup existing flags
echo "💾 Backing up existing flags..."
kubectl create job backup-flags-$TIMESTAMP \
  --from=cronjob/flag-backup \
  --environment=$ENVIRONMENT

# Deploy flag configurations
echo "📦 Deploying flag configurations..."
kubectl apply -f k8s/feature-flags/$ENVIRONMENT/

# Run post-deployment validation
echo "✅ Running post-deployment validation..."
npm run flags:validate -- --environment=$ENVIRONMENT --post-deployment

if [ $? -ne 0 ]; then
  echo "❌ Post-deployment validation failed"
  kubectl rollout undo deployment/healthier-sg-app
  exit 1
fi

# Update monitoring dashboards
echo "📊 Updating monitoring dashboards..."
kubectl apply -f k8s/monitoring/flag-dashboards-$ENVIRONMENT.yaml

echo "✅ Feature flags deployment completed successfully"
```

### Admin Dashboard

```typescript
// services/admin/flag-dashboard.ts
export class FeatureFlagDashboard {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const permissions = await this.getUserPermissions(userId);
    
    return {
      overview: await this.getFlagOverview(),
      activeFlags: await this.getActiveFlags(permissions),
      recentChanges: await this.getRecentChanges(),
      healthStatus: await this.getHealthStatus(),
      experiments: await this.getExperiments(permissions),
      compliance: await this.getComplianceStatus(),
      alerts: await this.getActiveAlerts()
    };
  }
  
  async updateFlag(flagId: string, updates: Partial<FeatureFlag>, userId: string): Promise<void> {
    // Verify user permissions
    if (!await this.hasPermission(userId, `flags:${updates.category}:update`)) {
      throw new Error('Insufficient permissions to update flag');
    }
    
    // Validate changes
    await this.validateFlagChanges(flagId, updates);
    
    // Check compliance impact
    const complianceImpact = await this.assessComplianceImpact(flagId, updates);
    if (complianceImpact.requiresApproval && !await this.hasComplianceApproval(userId)) {
      throw new Error('Compliance approval required for these changes');
    }
    
    // Apply changes with audit logging
    await this.applyFlagChanges(flagId, updates, userId);
    
    // Invalidate cache
    await this.invalidateFlagCache(flagId);
    
    // Notify stakeholders
    await this.notifyStakeholders(flagId, updates, userId);
  }
}
```

## Best Practices and Guidelines

### Flag Naming Conventions

```typescript
// Flag naming guidelines
interface FlagNamingConvention {
  prefix: string; // e.g., 'healthcare_', 'ui_', 'analytics_'
  category: string; // feature category
  action: string; // what the flag enables
  suffix?: string; // optional descriptive suffix
  
  examples: {
    'healthcare_telehealth_enabled': 'Enable telemedicine features'
    'ui_new_dashboard_v2': 'Enable new dashboard design v2'
    'analytics_user_tracking': 'Enable user behavior tracking'
    'compliance_enhanced_logging': 'Enable enhanced compliance logging'
  };
}
```

### Rollout Strategy Guidelines

1. **Development Phase**: Use boolean flags with manual activation
2. **Staging Phase**: Use percentage rollout with gradual increase
3. **Production Phase**: Use targeted rollout with monitoring
4. **Critical Features**: Always require manual approval and testing

### Safety Guidelines

1. **Always implement kill switches for critical features**
2. **Monitor error rates and performance impact continuously**
3. **Require compliance approval for healthcare features**
4. **Implement gradual rollout with health checks**
5. **Maintain detailed audit logs for all flag changes**

### Compliance Checklist

For Healthcare Features:
- [ ] PDPA compliance validated
- [ ] MOH requirements verified
- [ ] Audit logging enabled
- [ ] Emergency kill switch configured
- [ ] Provider approval obtained
- [ ] Patient consent mechanism in place
- [ ] Data retention policy defined
- [ ] Security review completed

---

*This document must be updated whenever feature flag architecture changes and reviewed quarterly for compliance with healthcare regulations.*