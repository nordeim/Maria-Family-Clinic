// A/B Testing Service with Statistical Significance Calculations
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

import { 
  ABTestConfig,
  ABTestVariant,
  ABTestResult,
  ABTestStatus,
  ABTestMetrics,
  HealthcareAnalyticsEvent
} from '../types/analytics.types';
import { abTestConfigSchema } from '../schemas/analytics.schema';

export interface StatisticalSignificanceResult {
  isSignificant: boolean;
  pValue: number;
  confidenceLevel: number;
  lift: number;
  power: number;
  sampleSizeRequired: number;
  effectSize: number;
  zScore: number;
}

export interface ABTestAssignment {
  userId: string;
  sessionId: string;
  testId: string;
  variantId: string;
  assignmentTimestamp: Date;
  isControl: boolean;
}

export interface ConversionEvent {
  userId: string;
  sessionId: string;
  testId: string;
  variantId: string;
  conversionType: string;
  value?: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export class ABTestingService {
  private static instance: ABTestingService;
  private activeTests: Map<string, ABTestConfig> = new Map();
  private userAssignments: Map<string, ABTestAssignment> = new Map();
  private conversionEvents: ConversionEvent[] = [];
  private statisticalCache: Map<string, StatisticalSignificanceResult> = new Map();

  private constructor() {
    this.initializeDefaultTests();
  }

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  // Test Management
  async createABTest(config: Partial<ABTestConfig>): Promise<ABTestConfig> {
    try {
      // Validate configuration
      const validatedConfig = abTestConfigSchema.parse({
        id: config.id || this.generateTestId(),
        name: config.name || '',
        description: config.description || '',
        hypothesis: config.hypothesis || '',
        status: config.status || ABTestStatus.DRAFT,
        startDate: config.startDate || new Date(),
        endDate: config.endDate,
        targetMetrics: config.targetMetrics || [],
        minimumSampleSize: config.minimumSampleSize || 1000,
        confidenceLevel: config.confidenceLevel || 0.95,
        significanceThreshold: config.significanceThreshold || 0.05,
        variants: config.variants || [],
        winner: config.winner,
        statisticalSignificance: config.statisticalSignificance || 0,
        lift: config.lift || 0,
        businessImpact: config.businessImpact || '',
      });

      // Ensure variants sum to 100% traffic split
      this.validateTrafficSplits(validatedConfig.variants);

      // Store test configuration
      this.activeTests.set(validatedConfig.id, validatedConfig);

      return validatedConfig;
    } catch (error) {
      throw new Error(`Failed to create A/B test: ${error}`);
    }
  }

  async getABTests(params?: {
    status?: ABTestStatus;
    sortBy?: 'startDate' | 'name' | 'performance';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ABTestConfig[]> {
    let tests = Array.from(this.activeTests.values());

    if (params?.status) {
      tests = tests.filter(test => test.status === params.status);
    }

    // Sort tests
    if (params?.sortBy) {
      tests.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (params.sortBy) {
          case 'startDate':
            aValue = new Date(a.startDate);
            bValue = new Date(b.startDate);
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'performance':
            aValue = a.statisticalSignificance;
            bValue = b.statisticalSignificance;
            break;
          default:
            return 0;
        }

        if (params.sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return tests;
  }

  async updateABTest(testId: string, updates: Partial<ABTestConfig>): Promise<ABTestConfig | null> {
    const test = this.activeTests.get(testId);
    if (!test) {
      return null;
    }

    const updatedTest = { ...test, ...updates };
    const validatedTest = abTestConfigSchema.parse(updatedTest);
    
    this.activeTests.set(testId, validatedTest);
    return validatedTest;
  }

  async startABTest(testId: string): Promise<boolean> {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== ABTestStatus.DRAFT) {
      return false;
    }

    test.status = ABTestStatus.RUNNING;
    test.startDate = new Date();
    
    // Clear any existing cache for this test
    this.clearTestCache(testId);
    
    return true;
  }

  async pauseABTest(testId: string): Promise<boolean> {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== ABTestStatus.RUNNING) {
      return false;
    }

    test.status = ABTestStatus.PAUSED;
    return true;
  }

  async completeABTest(testId: string, winnerId?: string): Promise<boolean> {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== ABTestStatus.RUNNING) {
      return false;
    }

    test.status = ABTestStatus.COMPLETED;
    test.endDate = new Date();
    
    if (winnerId) {
      test.winner = winnerId;
      // Calculate final results
      const results = await this.calculateTestResults(testId);
      test.statisticalSignificance = results.pValue;
      test.lift = results.lift;
    }

    return true;
  }

  // User Assignment
  async assignUserToTest(
    userId: string, 
    sessionId: string, 
    testId: string
  ): Promise<ABTestAssignment | null> {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== ABTestStatus.RUNNING) {
      return null;
    }

    // Check if user is already assigned
    const assignmentKey = `${userId}_${testId}`;
    if (this.userAssignments.has(assignmentKey)) {
      return this.userAssignments.get(assignmentKey)!;
    }

    // Assign user to variant based on traffic split
    const variant = this.assignUserToVariant(userId, test.variants);
    
    const assignment: ABTestAssignment = {
      userId,
      sessionId,
      testId,
      variantId: variant.id,
      assignmentTimestamp: new Date(),
      isControl: variant.isControl,
    };

    this.userAssignments.set(assignmentKey, assignment);
    
    // Track assignment as analytics event
    await this.trackAssignmentEvent(assignment);

    return assignment;
  }

  private assignUserToVariant(userId: string, variants: ABTestVariant[]): ABTestVariant {
    // Use consistent hashing for user assignment
    const hash = this.hashUser(userId);
    const random = hash % 10000 / 10000; // 0-1
    
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.trafficSplit;
      if (random <= cumulative) {
        return variant;
      }
    }

    // Fallback to control variant
    return variants.find(v => v.isControl) || variants[0];
  }

  private hashUser(userId: string): number {
    // Simple hash function for consistent user assignment
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Conversion Tracking
  async trackConversion(conversion: ConversionEvent): Promise<void> {
    // Validate conversion event
    if (!this.validateConversionEvent(conversion)) {
      return;
    }

    this.conversionEvents.push(conversion);

    // Update variant metrics
    const test = this.activeTests.get(conversion.testId);
    if (test) {
      const variant = test.variants.find(v => v.id === conversion.variantId);
      if (variant) {
        variant.metrics.conversions += 1;
        variant.metrics.conversionRate = 
          variant.metrics.conversions / variant.metrics.visitors;

        // Check for statistical significance
        await this.checkForSignificance(test.id);
      }
    }

    // Track as analytics event
    await this.trackConversionEvent(conversion);
  }

  private validateConversionEvent(conversion: ConversionEvent): boolean {
    // Check if test is active
    const test = this.activeTests.get(conversion.testId);
    if (!test || test.status !== ABTestStatus.RUNNING) {
      return false;
    }

    // Check if user is assigned to this test
    const assignmentKey = `${conversion.userId}_${conversion.testId}`;
    const assignment = this.userAssignments.get(assignmentKey);
    if (!assignment || assignment.variantId !== conversion.variantId) {
      return false;
    }

    return true;
  }

  // Statistical Analysis
  async calculateTestResults(testId: string): Promise<StatisticalSignificanceResult> {
    // Check cache first
    if (this.statisticalCache.has(testId)) {
      return this.statisticalCache.get(testId)!;
    }

    const test = this.activeTests.get(testId);
    if (!test || test.variants.length < 2) {
      throw new Error('Invalid test configuration');
    }

    // Get control and test variants
    const controlVariant = test.variants.find(v => v.isControl);
    const testVariants = test.variants.filter(v => !v.isControl);
    
    if (!controlVariant || testVariants.length === 0) {
      throw new Error('Control variant required for statistical analysis');
    }

    // Calculate results for each test variant
    const results: StatisticalSignificanceResult[] = [];

    for (const variant of testVariants) {
      const result = this.calculateStatisticalSignificance(
        controlVariant.metrics,
        variant.metrics,
        test.confidenceLevel,
        test.significanceThreshold
      );
      results.push(result);
    }

    // Return the best result (lowest p-value)
    const bestResult = results.reduce((best, current) => 
      current.pValue < best.pValue ? current : best
    );

    // Cache the result
    this.statisticalCache.set(testId, bestResult);

    return bestResult;
  }

  private calculateStatisticalSignificance(
    controlMetrics: ABTestMetrics,
    testMetrics: ABTestMetrics,
    confidenceLevel: number,
    significanceThreshold: number
  ): StatisticalSignificanceResult {
    // Calculate conversion rates
    const controlRate = controlMetrics.conversions / Math.max(controlMetrics.visitors, 1);
    const testRate = testMetrics.conversions / Math.max(testMetrics.visitors, 1);
    
    // Calculate lift
    const lift = ((testRate - controlRate) / Math.max(controlRate, 0.001)) * 100;
    
    // Calculate pooled standard error
    const pooledVariance = (controlRate * (1 - controlRate)) / controlMetrics.visitors +
                          (testRate * (1 - testRate)) / testMetrics.visitors;
    const standardError = Math.sqrt(pooledVariance);
    
    // Calculate z-score
    const zScore = Math.abs(testRate - controlRate) / standardError;
    
    // Calculate p-value (two-tailed test)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    // Calculate statistical power
    const effectSize = Math.abs(testRate - controlRate);
    const power = this.calculateStatisticalPower(effectSize, controlMetrics.visitors + testMetrics.visitors);
    
    // Calculate required sample size for desired power
    const sampleSizeRequired = this.calculateRequiredSampleSize(
      effectSize,
      confidenceLevel,
      0.8 // 80% power
    );

    return {
      isSignificant: pValue < significanceThreshold,
      pValue,
      confidenceLevel: 1 - pValue,
      lift,
      power,
      sampleSizeRequired,
      effectSize,
      zScore,
    };
  }

  private normalCDF(x: number): number {
    // Approximation of the cumulative distribution function for standard normal distribution
    const t = 1 / (1 + 0.2316419 * x);
    const d = 0.3989423 * Math.exp(-x * x / 2);
    let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    if (x > 0) prob = 1 - prob;
    return prob;
  }

  private calculateStatisticalPower(effectSize: number, totalSampleSize: number): number {
    // Simplified power calculation
    const alpha = 0.05; // Assuming 5% significance level
    const zAlpha = 1.96; // Two-tailed test at 95% confidence
    
    // Calculate non-centrality parameter
    const ncp = effectSize * Math.sqrt(totalSampleSize / 2);
    
    // Power is approximately 1 - beta, where beta is the probability of Type II error
    // This is a simplified approximation
    if (ncp > zAlpha) {
      return 0.8 + Math.min(0.2, (ncp - zAlpha) / 5);
    }
    
    return Math.max(0.05, 0.2 + (ncp / zAlpha) * 0.6);
  }

  private calculateRequiredSampleSize(
    effectSize: number,
    confidenceLevel: number,
    desiredPower: number
  ): number {
    // Calculate required sample size per variant for given effect size and power
    const zAlpha = this.getZScore(1 - (1 - confidenceLevel) / 2);
    const zBeta = this.getZScore(desiredPower);
    
    const pooledVariance = effectSize * (1 - effectSize / 2);
    
    const sampleSize = (Math.pow(zAlpha + zBeta, 2) * 2 * pooledVariance) / Math.pow(effectSize, 2);
    
    return Math.ceil(sampleSize);
  }

  private getZScore(probability: number): number {
    // Approximation of inverse normal CDF
    const a1 = -39.6968302866538;
    const a2 = 220.946098424521;
    const a3 = -275.928510446969;
    const a4 = 138.357751867269;
    const a5 = -30.6647980661472;
    const a6 = 2.50662827745924;

    const b1 = -54.4760987982241;
    const b2 = 161.585836858041;
    const b3 = -155.698979859887;
    const b4 = 66.8013118877197;
    const b5 = -13.2806815528857;

    const c1 = -0.00778489400243029;
    const c2 = -0.322396458041136;
    const c3 = -2.40075827716184;
    const c4 = -2.54973253934373;
    const c5 = 4.37466414146497;
    const c6 = 2.93816398269878;

    const d1 = 0.00778469570904146;
    const d2 = 0.32246712907004;
    const d3 = 2.445134137143;
    const d4 = 3.75440866190742;

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let q, r, x;

    if (probability < pLow) {
      q = Math.sqrt(-2 * Math.log(probability));
      x = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
          ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (probability <= pHigh) {
      q = probability - 0.5;
      r = q * q;
      x = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
          (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - probability));
      x = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
          ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }

    return x;
  }

  // Helper Methods
  private async checkForSignificance(testId: string): Promise<void> {
    try {
      const result = await this.calculateTestResults(testId);
      const test = this.activeTests.get(testId);
      
      if (test) {
        // Check if we should declare a winner
        if (result.isSignificant && result.lift > 5) { // 5% minimum lift
          // Find the best performing variant
          const bestVariant = test.variants.reduce((best, current) => {
            const bestConversionRate = best.metrics.conversions / Math.max(best.metrics.visitors, 1);
            const currentConversionRate = current.metrics.conversions / Math.max(current.metrics.visitors, 1);
            return currentConversionRate > bestConversionRate ? current : best;
          });

          test.winner = bestVariant.id;
          test.statisticalSignificance = result.pValue;
          test.lift = result.lift;
        }
      }
    } catch (error) {
      console.error('Error checking for significance:', error);
    }
  }

  private validateTrafficSplits(variants: ABTestVariant[]): void {
    const totalSplit = variants.reduce((sum, variant) => sum + variant.trafficSplit, 0);
    
    if (Math.abs(totalSplit - 1.0) > 0.001) {
      throw new Error('Traffic splits must sum to 100%');
    }

    const controlVariants = variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error('Exactly one control variant is required');
    }
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private clearTestCache(testId: string): void {
    this.statisticalCache.delete(testId);
    // Clear conversion events for this test
    this.conversionEvents = this.conversionEvents.filter(
      event => event.testId !== testId
    );
  }

  // Analytics Event Tracking
  private async trackAssignmentEvent(assignment: ABTestAssignment): Promise<void> {
    // This would integrate with your main analytics service
    console.log('Tracking A/B test assignment:', assignment);
  }

  private async trackConversionEvent(conversion: ConversionEvent): Promise<void> {
    // This would integrate with your main analytics service
    console.log('Tracking A/B test conversion:', conversion);
  }

  // Public API Methods
  async getTestResults(testId: string): Promise<ABTestResult | null> {
    const test = this.activeTests.get(testId);
    if (!test) {
      return null;
    }

    return {
      testId: test.id,
      testName: test.name,
      status: test.status,
      startDate: test.startDate,
      endDate: test.endDate,
      variants: test.variants,
      winner: test.winner,
      statisticalSignificance: test.statisticalSignificance,
      confidenceLevel: test.confidenceLevel,
      lift: test.lift,
      conversionMetrics: {
        primary: {
          name: 'conversion_rate',
          rate: this.getOverallConversionRate(test),
          change: test.lift,
          confidence: 1 - test.statisticalSignificance,
        },
        secondary: [],
        funnel: {
          steps: [],
          totalDropOff: 0,
          biggestDropOffStep: '',
          optimizationSuggestions: [],
        },
      },
    };
  }

  private getOverallConversionRate(test: ABTestConfig): number {
    const totalConversions = test.variants.reduce((sum, v) => sum + v.metrics.conversions, 0);
    const totalVisitors = test.variants.reduce((sum, v) => sum + v.metrics.visitors, 0);
    return totalVisitors > 0 ? totalConversions / totalVisitors : 0;
  }

  async getActiveTests(): Promise<ABTestConfig[]> {
    return Array.from(this.activeTests.values()).filter(
      test => test.status === ABTestStatus.RUNNING
    );
  }

  async getUserVariant(userId: string, testId: string): Promise<string | null> {
    const assignmentKey = `${userId}_${testId}`;
    const assignment = this.userAssignments.get(assignmentKey);
    return assignment ? assignment.variantId : null;
  }

  async getTestPerformance(): Promise<{
    activeTests: number;
    completedTests: number;
    significantResults: number;
    averageLift: number;
  }> {
    const tests = Array.from(this.activeTests.values());
    const activeTests = tests.filter(t => t.status === ABTestStatus.RUNNING).length;
    const completedTests = tests.filter(t => t.status === ABTestStatus.COMPLETED).length;
    const significantResults = tests.filter(t => t.statisticalSignificance < 0.05).length;
    
    const lifts = tests.filter(t => t.lift !== 0).map(t => t.lift);
    const averageLift = lifts.length > 0 ? 
      lifts.reduce((sum, lift) => sum + lift, 0) / lifts.length : 0;

    return {
      activeTests,
      completedTests,
      significantResults,
      averageLift,
    };
  }
}

// Export singleton instance
export const abTestingService = ABTestingService.getInstance();