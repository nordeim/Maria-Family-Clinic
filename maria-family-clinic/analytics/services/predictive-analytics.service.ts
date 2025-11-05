// Predictive Analytics Service for Healthcare Demand Forecasting
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

import { 
  PredictiveAnalytics,
  DemandForecast,
  CapacityPlan,
  PatientFlowPrediction,
  SeasonalAdjustment,
  RiskAssessment,
  PredictiveRecommendation,
  TimeRange,
  TimeRangeKey
} from '../types/analytics.types';

export interface ForecastingModel {
  name: string;
  version: string;
  accuracy: number;
  lastTrained: Date;
  features: string[];
  hyperparameters: Record<string, any>;
}

export interface TrainingData {
  clinicId: string;
  date: Date;
  appointments: number;
  enquiries: number;
  noShows: number;
  cancellations: number;
  demographics: {
    ageGroups: Record<string, number>;
    genderDistribution: Record<string, number>;
  };
  weather?: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
  events?: {
    holidays: boolean;
    schoolTerms: boolean;
    events: string[];
  };
  seasonality: {
    dayOfWeek: number;
    month: number;
    isWeekend: boolean;
    season: 'spring' | 'summer' | 'autumn' | 'winter';
  };
}

export interface ModelPrediction {
  date: Date;
  predictedValue: number;
  confidenceInterval: [number, number];
  featureImportance: Record<string, number>;
  modelContributions: Record<string, number>;
}

export class PredictiveAnalyticsService {
  private static instance: PredictiveAnalyticsService;
  private models: Map<string, ForecastingModel> = new Map();
  private historicalData: Map<string, TrainingData[]> = new Map();
  private predictions: Map<string, ModelPrediction[]> = new Map();

  private constructor() {
    this.initializeModels();
  }

  static getInstance(): PredictiveAnalyticsService {
    if (!PredictiveAnalyticsService.instance) {
      PredictiveAnalyticsService.instance = new PredictiveAnalyticsService();
    }
    return PredictiveAnalyticsService.instance;
  }

  // Initialize forecasting models
  private initializeModels(): void {
    const models: ForecastingModel[] = [
      {
        name: 'demand_forecasting_lstm',
        version: '1.2.3',
        accuracy: 0.87,
        lastTrained: new Date('2025-01-01'),
        features: [
          'day_of_week', 'month', 'is_weekend', 'season',
          'historical_appointments', 'enquiries', 'weather',
          'holidays', 'school_terms', 'demographics'
        ],
        hyperparameters: {
          sequence_length: 30,
          hidden_units: 128,
          dropout_rate: 0.2,
          learning_rate: 0.001,
        },
      },
      {
        name: 'capacity_planning_linear',
        version: '2.1.0',
        accuracy: 0.92,
        lastTrained: new Date('2025-01-01'),
        features: [
          'predicted_appointments', 'average_appointment_duration',
          'staff_availability', 'utilization_history', 'no_show_rate'
        ],
        hyperparameters: {
          regularization: 'l2',
          alpha: 0.1,
          max_iterations: 1000,
        },
      },
      {
        name: 'patient_flow_poisson',
        version: '1.0.5',
        accuracy: 0.79,
        lastTrained: new Date('2024-12-15'),
        features: [
          'hour_of_day', 'day_of_week', 'seasonality',
          'clinic_capacity', 'historical_flow', 'external_events'
        ],
        hyperparameters: {
          link_function: 'log',
          overdispersion: true,
        },
      },
    ];

    for (const model of models) {
      this.models.set(model.name, model);
    }
  }

  // Main predictive analytics methods
  async generateDemandForecasting(params: {
    clinicId: string;
    forecastDays: number;
    includeWeather: boolean;
    includeEvents: boolean;
    confidenceLevel: number;
  }): Promise<DemandForecast[]> {
    const {
      clinicId,
      forecastDays = 30,
      includeWeather = true,
      includeEvents = true,
      confidenceLevel = 0.95
    } = params;

    try {
      // Get historical data for the clinic
      const historicalData = await this.getHistoricalData(clinicId);
      
      // Generate predictions for each day
      const forecasts: DemandForecast[] = [];
      
      for (let i = 0; i < forecastDays; i++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + i);
        
        const prediction = await this.predictDailyDemand(
          historicalData,
          forecastDate,
          includeWeather,
          includeEvents
        );
        
        const confidenceInterval = this.calculateConfidenceInterval(
          prediction.predictedValue,
          prediction.confidenceInterval,
          confidenceLevel
        );
        
        forecasts.push({
          clinicId,
          date: forecastDate,
          predictedAppointments: Math.round(prediction.predictedValue),
          confidence: this.calculateModelConfidence(prediction),
          lowerBound: Math.round(confidenceInterval[0]),
          upperBound: Math.round(confidenceInterval[1]),
          factors: this.identifyForecastFactors(prediction),
          modelVersion: this.models.get('demand_forecasting_lstm')!.version,
          generatedAt: new Date(),
        });
      }
      
      return forecasts;
    } catch (error) {
      throw new Error(`Failed to generate demand forecasting: ${error}`);
    }
  }

  async generateCapacityPlanning(params: {
    clinicId: string;
    forecastDays: number;
    includeSeasonalAdjustments: boolean;
  }): Promise<CapacityPlan[]> {
    const {
      clinicId,
      forecastDays = 7,
      includeSeasonalAdjustments = true
    } = params;

    try {
      // Get demand forecasts
      const demandForecasts = await this.generateDemandForecasting({
        clinicId,
        forecastDays,
        includeWeather: true,
        includeEvents: true,
        confidenceLevel: 0.90
      });
      
      const capacityPlans: CapacityPlan[] = [];
      
      for (const forecast of demandForecasts) {
        // Calculate recommended staff based on predicted demand
        const recommendedStaff = this.calculateRecommendedStaff(forecast.predictedAppointments);
        
        // Calculate recommended capacity
        const recommendedCapacity = this.calculateRecommendedCapacity(forecast.predictedAppointments);
        
        // Calculate utilization rate
        const utilizationRate = recommendedCapacity > 0 ? 
          (forecast.predictedAppointments / recommendedCapacity) * 100 : 0;
        
        // Calculate efficiency score
        const efficiencyScore = this.calculateEfficiencyScore(
          forecast.predictedAppointments,
          recommendedStaff,
          recommendedCapacity
        );
        
        capacityPlans.push({
          clinicId,
          date: forecast.date,
          recommendedStaff,
          recommendedCapacity,
          utilizationRate: Math.round(utilizationRate * 100) / 100,
          efficiencyScore: Math.round(efficiencyScore * 100) / 100,
        });
      }
      
      return capacityPlans;
    } catch (error) {
      throw new Error(`Failed to generate capacity planning: ${error}`);
    }
  }

  async generatePatientFlowPrediction(params: {
    clinicId: string;
    forecastHours: number;
    includeRealtimeData: boolean;
  }): Promise<PatientFlowPrediction[]> {
    const {
      clinicId,
      forecastHours = 24,
      includeRealtimeData = true
    } = params;

    try {
      const flowPredictions: PatientFlowPrediction[] = [];
      const now = new Date();
      
      // Get current clinic capacity
      const clinicCapacity = await this.getClinicCapacity(clinicId);
      
      for (let hour = 0; hour < forecastHours; hour++) {
        const predictionTime = new Date(now);
        predictionTime.setHours(now.getHours() + hour, 0, 0, 0);
        
        // Predict wait time based on historical patterns and current load
        const predictedWaitTime = this.predictWaitTime(
          predictionTime,
          clinicCapacity,
          includeRealtimeData
        );
        
        // Predict queue length
        const predictedQueueLength = this.predictQueueLength(
          predictionTime,
          predictedWaitTime,
          clinicCapacity
        );
        
        // Predict utilization rate
        const predictedUtilizationRate = this.predictUtilizationRate(
          predictionTime,
          clinicCapacity,
          predictedQueueLength
        );
        
        flowPredictions.push({
          clinicId,
          hour: predictionTime.getHours(),
          predictedWaitTime: Math.round(predictedWaitTime),
          predictedQueueLength: Math.round(predictedQueueLength),
          predictedUtilizationRate: Math.round(predictedUtilizationRate * 100) / 100,
        });
      }
      
      return flowPredictions;
    } catch (error) {
      throw new Error(`Failed to generate patient flow prediction: ${error}`);
    }
  }

  async generateSeasonalAdjustments(params: {
    clinicId: string;
    adjustmentPeriod: 'weekly' | 'monthly' | 'yearly';
  }): Promise<SeasonalAdjustment[]> {
    const { clinicId, adjustmentPeriod } = params;
    
    try {
      const seasonalAdjustments: SeasonalAdjustment[] = [];
      
      // Analyze historical data for seasonal patterns
      const historicalData = await this.getHistoricalData(clinicId);
      
      // Calculate seasonal factors based on historical patterns
      const seasonalFactors = this.calculateSeasonalFactors(historicalData);
      
      // Generate adjustments for each time period
      for (const [period, factor] of Object.entries(seasonalFactors)) {
        seasonalAdjustments.push({
          period,
          adjustmentFactor: factor,
          confidence: this.calculateSeasonalConfidence(factor, historicalData),
          description: this.getSeasonalDescription(period, factor),
        });
      }
      
      return seasonalAdjustments;
    } catch (error) {
      throw new Error(`Failed to generate seasonal adjustments: ${error}`);
    }
  }

  async generateRiskAssessment(params: {
    clinicId?: string;
    riskTypes: string[];
    assessmentPeriod: number;
  }): Promise<RiskAssessment[]> {
    const { clinicId, riskTypes, assessmentPeriod = 30 } = params;
    
    try {
      const riskAssessments: RiskAssessment[] = [];
      
      for (const riskType of riskTypes) {
        const assessment = await this.assessRisk(
          riskType,
          clinicId,
          assessmentPeriod
        );
        
        if (assessment) {
          riskAssessments.push(assessment);
        }
      }
      
      return riskAssessments;
    } catch (error) {
      throw new Error(`Failed to generate risk assessment: ${error}`);
    }
  }

  async generateRecommendations(params: {
    clinicId: string;
    forecastDays: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<PredictiveRecommendation[]> {
    const {
      clinicId,
      forecastDays = 7,
      priority = 'medium'
    } = params;

    try {
      // Generate all predictive analytics
      const [
        demandForecasts,
        capacityPlans,
        patientFlowPredictions,
        riskAssessments
      ] = await Promise.all([
        this.generateDemandForecasting({
          clinicId,
          forecastDays,
          includeWeather: true,
          includeEvents: true,
          confidenceLevel: 0.90
        }),
        this.generateCapacityPlanning({
          clinicId,
          forecastDays,
          includeSeasonalAdjustments: true
        }),
        this.generatePatientFlowPrediction({
          clinicId,
          forecastHours: 24,
          includeRealtimeData: true
        }),
        this.generateRiskAssessment({
          clinicId,
          riskTypes: ['capacity_overload', 'staff_shortage', 'high_wait_times'],
          assessmentPeriod: forecastDays
        })
      ]);

      const recommendations: PredictiveRecommendation[] = [];

      // Analyze capacity recommendations
      const capacityRecommendations = this.generateCapacityRecommendations(
        capacityPlans,
        riskAssessments
      );
      recommendations.push(...capacityRecommendations);

      // Analyze flow predictions
      const flowRecommendations = this.generateFlowRecommendations(
        patientFlowPredictions,
        riskAssessments
      );
      recommendations.push(...flowRecommendations);

      // Analyze demand patterns
      const demandRecommendations = this.generateDemandRecommendations(
        demandForecasts,
        riskAssessments
      );
      recommendations.push(...demandRecommendations);

      // Filter by priority
      return recommendations
        .filter(rec => this.matchesPriority(rec.priority, priority))
        .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));

    } catch (error) {
      throw new Error(`Failed to generate recommendations: ${error}`);
    }
  }

  // Private helper methods for predictions
  private async predictDailyDemand(
    historicalData: TrainingData[],
    forecastDate: Date,
    includeWeather: boolean,
    includeEvents: boolean
  ): Promise<ModelPrediction> {
    // Extract features for the forecast date
    const features = this.extractDateFeatures(forecastDate);
    
    // Add weather data if available
    let weatherFeatures = {};
    if (includeWeather) {
      weatherFeatures = await this.getWeatherData(forecastDate);
    }
    
    // Add event data if available
    let eventFeatures = {};
    if (includeEvents) {
      eventFeatures = await this.getEventData(forecastDate);
    }
    
    // Combine all features
    const allFeatures = {
      ...features,
      ...weatherFeatures,
      ...eventFeatures,
    };
    
    // Use LSTM model for prediction
    const prediction = await this.runLSTMPrediction(historicalData, allFeatures);
    
    return prediction;
  }

  private async runLSTMPrediction(
    historicalData: TrainingData[],
    features: Record<string, any>
  ): Promise<ModelPrediction> {
    // Simplified LSTM prediction logic
    // In a real implementation, this would use TensorFlow.js or a similar library
    
    const baseAppointmentRate = 15; // Base appointments per day
    
    // Apply feature-based adjustments
    let adjustedRate = baseAppointmentRate;
    
    // Day of week adjustment
    const dayOfWeek = features.day_of_week;
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
      adjustedRate *= 1.2;
    } else { // Weekends
      adjustedRate *= 0.6;
    }
    
    // Month adjustment (simplified seasonal pattern)
    const month = features.month;
    if (month >= 1 && month <= 3) { // Q1 - New Year resolutions
      adjustedRate *= 1.15;
    } else if (month >= 4 && month <= 6) { // Q2
      adjustedRate *= 1.0;
    } else if (month >= 7 && month <= 9) { // Q3 - Summer
      adjustedRate *= 0.9;
    } else { // Q4 - Year end checkups
      adjustedRate *= 1.1;
    }
    
    // Weather adjustment
    if (features.weather?.temperature) {
      const temp = features.weather.temperature;
      if (temp < 20 || temp > 32) { // Extreme temperatures
        adjustedRate *= 1.1;
      }
    }
    
    // Event adjustment
    if (features.events?.holidays) {
      adjustedRate *= 0.3; // Reduced activity on holidays
    }
    
    // Add some randomness to simulate model uncertainty
    const uncertainty = Math.random() * 0.2 - 0.1; // ±10% uncertainty
    const predictedValue = adjustedRate * (1 + uncertainty);
    
    return {
      date: new Date(),
      predictedValue,
      confidenceInterval: [
        predictedValue * 0.8,
        predictedValue * 1.2
      ],
      featureImportance: {
        day_of_week: 0.25,
        month: 0.20,
        weather: 0.15,
        events: 0.10,
        historical_trend: 0.30,
      },
      modelContributions: {
        base_prediction: baseAppointmentRate,
        seasonal_adjustment: adjustedRate - baseAppointmentRate,
        feature_adjustments: 0,
        uncertainty: uncertainty * adjustedRate,
      },
    };
  }

  private async getHistoricalData(clinicId: string): Promise<TrainingData[]> {
    // Return mock historical data
    const data: TrainingData[] = [];
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        clinicId,
        date,
        appointments: Math.floor(Math.random() * 50) + 10,
        enquiries: Math.floor(Math.random() * 20) + 5,
        noShows: Math.floor(Math.random() * 8) + 1,
        cancellations: Math.floor(Math.random() * 5) + 1,
        demographics: {
          ageGroups: {
            '18-30': Math.floor(Math.random() * 10) + 5,
            '31-45': Math.floor(Math.random() * 15) + 8,
            '46-60': Math.floor(Math.random() * 12) + 6,
            '60+': Math.floor(Math.random() * 8) + 4,
          },
          genderDistribution: {
            male: Math.floor(Math.random() * 20) + 10,
            female: Math.floor(Math.random() * 30) + 15,
          },
        },
        weather: {
          temperature: Math.floor(Math.random() * 20) + 20,
          humidity: Math.floor(Math.random() * 40) + 40,
          rainfall: Math.random() * 10,
        },
        events: {
          holidays: Math.random() < 0.03, // ~3% chance
          schoolTerms: date.getMonth() >= 1 && date.getMonth() <= 10, // School terms
          events: [],
        },
        seasonality: {
          dayOfWeek: date.getDay(),
          month: date.getMonth() + 1,
          isWeekend: date.getDay() === 0 || date.getDay() === 6,
          season: this.getSeason(date.getMonth() + 1),
        },
      });
    }
    
    return data;
  }

  private extractDateFeatures(date: Date): Record<string, any> {
    return {
      day_of_week: date.getDay(),
      month: date.getMonth() + 1,
      day_of_month: date.getDate(),
      is_weekend: date.getDay() === 0 || date.getDay() === 6,
      is_holiday: false, // Would be determined by holiday calendar
    };
  }

  private async getWeatherData(date: Date): Promise<Record<string, any>> {
    // Mock weather data - in real implementation, would call weather API
    return {
      temperature: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 40,
      rainfall: Math.random() * 5,
      uv_index: Math.floor(Math.random() * 10) + 1,
    };
  }

  private async getEventData(date: Date): Promise<Record<string, any>> {
    // Mock event data - in real implementation, would check Singapore events
    const isPublicHoliday = Math.random() < 0.03; // ~3% chance
    
    return {
      holidays: isPublicHoliday,
      school_terms: date.getMonth() >= 1 && date.getMonth() <= 10,
      events: isPublicHoliday ? ['Public Holiday'] : [],
    };
  }

  private calculateConfidenceInterval(
    predictedValue: number,
    baseInterval: [number, number],
    confidenceLevel: number
  ): [number, number] {
    // Adjust interval width based on confidence level
    const width = baseInterval[1] - baseInterval[0];
    const adjustment = (1 - confidenceLevel) * 0.5;
    
    return [
      baseInterval[0] - adjustment * width,
      baseInterval[1] + adjustment * width,
    ];
  }

  private calculateModelConfidence(prediction: ModelPrediction): number {
    // Calculate confidence based on feature importance and model consistency
    const featureImportanceValues = Object.values(prediction.featureImportance);
    const averageImportance = featureImportanceValues.reduce((sum, val) => sum + val, 0) / featureImportanceValues.length;
    
    // Higher feature importance variance = lower confidence
    const variance = featureImportanceValues.reduce((sum, val) => sum + Math.pow(val - averageImportance, 2), 0) / featureImportanceValues.length;
    const consistencyScore = 1 - Math.min(variance, 1);
    
    return Math.round(consistencyScore * 100) / 100;
  }

  private identifyForecastFactors(prediction: ModelPrediction): Array<{
    factor: string;
    impact: number;
    description: string;
  }> {
    const factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }> = [];
    
    // Convert feature importance to factors
    for (const [feature, importance] of Object.entries(prediction.featureImportance)) {
      if (importance > 0.1) { // Only include significant factors
        factors.push({
          factor: this.formatFeatureName(feature),
          impact: importance,
          description: this.getFeatureDescription(feature, importance),
        });
      }
    }
    
    return factors.sort((a, b) => b.impact - a.impact);
  }

  private formatFeatureName(feature: string): string {
    return feature
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getFeatureDescription(feature: string, importance: number): string {
    const descriptions: Record<string, string> = {
      day_of_week: 'Weekday vs weekend patterns significantly influence appointment demand',
      month: 'Seasonal variations throughout the year affect patient behavior',
      weather: 'Temperature and weather conditions impact healthcare seeking behavior',
      events: 'Public holidays and special events reduce or increase demand',
      historical_trend: 'Past appointment patterns provide baseline prediction',
    };
    
    return descriptions[feature] || `${this.formatFeatureName(feature)} influences demand patterns`;
  }

  // Capacity planning methods
  private calculateRecommendedStaff(predictedAppointments: number): number {
    // Base staff calculation: 1 staff member per 8 appointments
    const baseStaff = Math.ceil(predictedAppointments / 8);
    
    // Add buffer for peak hours and administrative tasks
    const buffer = Math.ceil(baseStaff * 0.3);
    
    return baseStaff + buffer;
  }

  private calculateRecommendedCapacity(predictedAppointments: number): number {
    // Capacity should accommodate predicted demand plus buffer
    const bufferPercentage = 0.2; // 20% buffer
    return Math.ceil(predictedAppointments * (1 + bufferPercentage));
  }

  private calculateEfficiencyScore(
    predictedAppointments: number,
    recommendedStaff: number,
    recommendedCapacity: number
  ): number {
    // Efficiency score based on staff utilization and capacity utilization
    const staffUtilization = predictedAppointments / (recommendedStaff * 8); // Assuming 8 appointments per staff
    const capacityUtilization = predictedAppointments / recommendedCapacity;
    
    // Optimal efficiency when both are around 0.8-0.9
    const staffScore = Math.min(staffUtilization, 1);
    const capacityScore = Math.min(capacityUtilization, 1);
    
    return (staffScore + capacityScore) / 2;
  }

  // Patient flow prediction methods
  private async getClinicCapacity(clinicId: string): Promise<number> {
    // Mock clinic capacity - in real implementation, would get from database
    return 100; // Maximum patients per day
  }

  private predictWaitTime(
    dateTime: Date,
    clinicCapacity: number,
    includeRealtimeData: boolean
  ): number {
    const hour = dateTime.getHours();
    const dayOfWeek = dateTime.getDay();
    
    // Base wait time calculation
    let baseWaitTime = 10; // 10 minutes base
    
    // Peak hour adjustments
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) {
      baseWaitTime *= 1.5;
    }
    
    // Weekend adjustments
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseWaitTime *= 0.7; // Shorter waits on weekends
    }
    
    // Add real-time adjustment if available
    if (includeRealtimeData) {
      const realtimeLoad = Math.random() * 0.5 + 0.5; // 50-100% load
      baseWaitTime *= realtimeLoad;
    }
    
    return baseWaitTime;
  }

  private predictQueueLength(
    dateTime: Date,
    predictedWaitTime: number,
    clinicCapacity: number
  ): number {
    // Estimate queue length based on wait time and average service time
    const averageServiceTime = 30; // 30 minutes average
    const queueLength = (predictedWaitTime / averageServiceTime) * (Math.random() * 3 + 1);
    
    return Math.max(0, queueLength);
  }

  private predictUtilizationRate(
    dateTime: Date,
    clinicCapacity: number,
    predictedQueueLength: number
  ): number {
    // Base utilization rate calculation
    const hour = dateTime.getHours();
    let baseUtilization = 0.6; // 60% base utilization
    
    // Peak hour utilization
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) {
      baseUtilization = 0.85;
    }
    
    // Add queue effect
    const queueUtilization = Math.min(predictedQueueLength / 10, 0.3);
    
    return Math.min(baseUtilization + queueUtilization, 1);
  }

  // Seasonal analysis methods
  private calculateSeasonalFactors(data: TrainingData[]): Record<string, number> {
    const factors: Record<string, number> = {};
    
    // Calculate weekly patterns
    const weeklyFactors = this.calculateWeeklyPatterns(data);
    factors['weekly'] = weeklyFactors.avg;
    
    // Calculate monthly patterns
    const monthlyFactors = this.calculateMonthlyPatterns(data);
    factors['monthly'] = monthlyFactors.avg;
    
    // Calculate seasonal patterns
    const seasonalFactors = this.calculateSeasonalPatterns(data);
    for (const [season, factor] of Object.entries(seasonalFactors)) {
      factors[season] = factor;
    }
    
    return factors;
  }

  private calculateWeeklyPatterns(data: TrainingData[]): { avg: number; variance: number } {
    const dayFactors: number[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dayData = data.filter(d => d.seasonality.dayOfWeek === day);
      if (dayData.length > 0) {
        const avgAppointments = dayData.reduce((sum, d) => sum + d.appointments, 0) / dayData.length;
        dayFactors.push(avgAppointments / 20); // Normalize to baseline of 20
      }
    }
    
    const avg = dayFactors.reduce((sum, f) => sum + f, 0) / dayFactors.length;
    const variance = dayFactors.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / dayFactors.length;
    
    return { avg, variance };
  }

  private calculateMonthlyPatterns(data: TrainingData[]): { avg: number; variance: number } {
    const monthlyFactors: number[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthData = data.filter(d => d.seasonality.month === month);
      if (monthData.length > 0) {
        const avgAppointments = monthData.reduce((sum, d) => sum + d.appointments, 0) / monthData.length;
        monthlyFactors.push(avgAppointments / 20); // Normalize to baseline
      }
    }
    
    const avg = monthlyFactors.reduce((sum, f) => sum + f, 0) / monthlyFactors.length;
    const variance = monthlyFactors.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / monthlyFactors.length;
    
    return { avg, variance };
  }

  private calculateSeasonalPatterns(data: TrainingData[]): Record<string, number> {
    const seasonData: Record<string, number[]> = {
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    };
    
    for (const d of data) {
      const season = d.seasonality.season;
      const normalizedAppointments = d.appointments / 20;
      seasonData[season].push(normalizedAppointments);
    }
    
    const patterns: Record<string, number> = {};
    for (const [season, values] of Object.entries(seasonData)) {
      if (values.length > 0) {
        patterns[season] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    }
    
    return patterns;
  }

  private calculateSeasonalConfidence(factor: number, data: TrainingData[]): number {
    // Higher confidence for factors based on more data points
    const dataPoints = data.length;
    return Math.min(0.95, 0.5 + (dataPoints / 1000) * 0.45);
  }

  private getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
    // Simplified seasonal mapping for Singapore (tropical climate)
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private getSeasonalDescription(period: string, factor: number): string {
    const descriptions: Record<string, string> = {
      weekly: `Weekly patterns show ${factor > 1 ? 'higher' : 'lower'} demand on certain days`,
      monthly: `Monthly trends indicate ${factor > 1 ? 'increased' : 'decreased'} activity in certain months`,
      spring: 'Spring season shows moderate healthcare demand',
      summer: 'Summer period has higher air conditioning-related health issues',
      autumn: 'Autumn maintains steady healthcare utilization',
      winter: 'Winter season (end of year) sees increased health check-ups',
    };
    
    return descriptions[period] || `Seasonal factor of ${factor.toFixed(2)} influences demand patterns`;
  }

  // Risk assessment methods
  private async assessRisk(
    riskType: string,
    clinicId?: string,
    assessmentPeriod: number = 30
  ): Promise<RiskAssessment | null> {
    switch (riskType) {
      case 'capacity_overload':
        return this.assessCapacityOverloadRisk(clinicId, assessmentPeriod);
      case 'staff_shortage':
        return this.assessStaffShortageRisk(clinicId, assessmentPeriod);
      case 'high_wait_times':
        return this.assessHighWaitTimesRisk(clinicId, assessmentPeriod);
      default:
        return null;
    }
  }

  private assessCapacityOverloadRisk(
    clinicId?: string,
    assessmentPeriod: number = 30
  ): RiskAssessment {
    // Simulate capacity overload risk assessment
    const probability = Math.random() * 0.3 + 0.1; // 10-40% probability
    const impact: 'low' | 'medium' | 'high' | 'critical' = 
      probability > 0.3 ? 'high' : probability > 0.2 ? 'medium' : 'low';

    return {
      riskType: 'capacity_overload',
      clinicId,
      probability,
      impact,
      mitigationStrategies: [
        'Implement dynamic scheduling to balance demand',
        'Add temporary staff during peak periods',
        'Extend clinic hours during high-demand periods',
        'Improve appointment booking system to distribute demand',
      ],
      monitoringMetrics: [
        'Daily appointment volume',
        'Staff utilization rates',
        'Patient wait times',
        'No-show rates',
      ],
    };
  }

  private assessStaffShortageRisk(
    clinicId?: string,
    assessmentPeriod: number = 30
  ): RiskAssessment {
    const probability = Math.random() * 0.4 + 0.05; // 5-45% probability
    const impact: 'low' | 'medium' | 'high' | 'critical' = 
      probability > 0.35 ? 'critical' : probability > 0.25 ? 'high' : 'medium';

    return {
      riskType: 'staff_shortage',
      clinicId,
      probability,
      impact,
      mitigationStrategies: [
        'Maintain backup staff pool',
        'Cross-train existing staff',
        'Implement flexible scheduling',
        'Partner with staffing agencies',
      ],
      monitoringMetrics: [
        'Staff availability rates',
        'Absenteeism rates',
        'Turnover rates',
        'Training completion rates',
      ],
    };
  }

  private assessHighWaitTimesRisk(
    clinicId?: string,
    assessmentPeriod: number = 30
  ): RiskAssessment {
    const probability = Math.random() * 0.35 + 0.1; // 10-45% probability
    const impact: 'low' | 'medium' | 'high' | 'critical' = 
      probability > 0.3 ? 'high' : 'medium';

    return {
      riskType: 'high_wait_times',
      clinicId,
      probability,
      impact,
      mitigationStrategies: [
        'Optimize appointment scheduling algorithms',
        'Implement queue management system',
        'Provide estimated wait times to patients',
        'Add express lanes for quick consultations',
      ],
      monitoringMetrics: [
        'Average wait times',
        'Queue length monitoring',
        'Patient satisfaction scores',
        'Appointment completion rates',
      ],
    };
  }

  // Recommendation generation methods
  private generateCapacityRecommendations(
    capacityPlans: CapacityPlan[],
    riskAssessments: RiskAssessment[]
  ): PredictiveRecommendation[] {
    const recommendations: PredictiveRecommendation[] = [];
    
    // Check for capacity overload risks
    const overloadRisks = riskAssessments.filter(r => r.riskType === 'capacity_overload');
    if (overloadRisks.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Capacity Management',
        title: 'Capacity Overload Prevention',
        description: 'Implement proactive capacity management to prevent overload situations',
        expectedBenefit: 'Reduce patient wait times by 25% and improve satisfaction',
        implementationEffort: 'medium',
        timeline: '2-3 weeks',
      });
    }
    
    // Check for staff shortage risks
    const staffRisks = riskAssessments.filter(r => r.riskType === 'staff_shortage');
    if (staffRisks.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Staffing',
        title: 'Staff Shortage Mitigation',
        description: 'Develop comprehensive staffing strategy to address potential shortages',
        expectedBenefit: 'Ensure continuous service delivery and maintain quality standards',
        implementationEffort: 'high',
        timeline: '4-6 weeks',
      });
    }
    
    return recommendations;
  }

  private generateFlowRecommendations(
    flowPredictions: PatientFlowPrediction[],
    riskAssessments: RiskAssessment[]
  ): PredictiveRecommendation[] {
    const recommendations: PredictiveRecommendation[] = [];
    
    // Check for high wait time predictions
    const highWaitTimes = flowPredictions.filter(p => p.predictedWaitTime > 30);
    if (highWaitTimes.length > 5) { // If more than 5 hours have high wait times
      recommendations.push({
        priority: 'high',
        category: 'Patient Flow',
        title: 'Wait Time Optimization',
        description: 'Implement dynamic scheduling and queue management to reduce wait times',
        expectedBenefit: 'Reduce average wait times by 40% during peak hours',
        implementationEffort: 'medium',
        timeline: '3-4 weeks',
      });
    }
    
    return recommendations;
  }

  private generateDemandRecommendations(
    demandForecasts: DemandForecast[],
    riskAssessments: RiskAssessment[]
  ): PredictiveRecommendation[] {
    const recommendations: PredictiveRecommendation[] = [];
    
    // Analyze demand patterns for recommendations
    const avgDemand = demandForecasts.reduce((sum, f) => sum + f.predictedAppointments, 0) / demandForecasts.length;
    const peakDays = demandForecasts.filter(f => f.predictedAppointments > avgDemand * 1.2);
    
    if (peakDays.length > demandForecasts.length * 0.3) { // If >30% are peak days
      recommendations.push({
        priority: 'medium',
        category: 'Demand Management',
        title: 'Peak Day Preparation',
        description: 'Develop specific strategies for managing peak demand days',
        expectedBenefit: 'Better resource allocation and improved patient experience',
        implementationEffort: 'low',
        timeline: '1-2 weeks',
      });
    }
    
    return recommendations;
  }

  // Utility methods
  private matchesPriority(recommendationPriority: string, filterPriority: string): boolean {
    const priorityScores = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
    };
    
    return priorityScores[recommendationPriority as keyof typeof priorityScores] >= 
           priorityScores[filterPriority as keyof typeof priorityScores];
  }

  private getPriorityScore(priority: string): number {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 };
    return scores[priority as keyof typeof scores] || 0;
  }

  // Public API methods
  async getPredictiveAnalytics(params: {
    clinicId: string;
    forecastDays: number;
  }): Promise<PredictiveAnalytics> {
    const { clinicId, forecastDays } = params;
    
    try {
      const [
        demandForecasting,
        capacityPlanning,
        patientFlowPrediction,
        seasonalAdjustments,
        riskAssessment
      ] = await Promise.all([
        this.generateDemandForecasting({
          clinicId,
          forecastDays,
          includeWeather: true,
          includeEvents: true,
          confidenceLevel: 0.90
        }),
        this.generateCapacityPlanning({
          clinicId,
          forecastDays,
          includeSeasonalAdjustments: true
        }),
        this.generatePatientFlowPrediction({
          clinicId,
          forecastHours: 24,
          includeRealtimeData: true
        }),
        this.generateSeasonalAdjustments({
          clinicId,
          adjustmentPeriod: 'monthly'
        }),
        this.generateRiskAssessment({
          clinicId,
          riskTypes: ['capacity_overload', 'staff_shortage', 'high_wait_times'],
          assessmentPeriod: forecastDays
        })
      ]);
      
      const recommendations = await this.generateRecommendations({
        clinicId,
        forecastDays,
        priority: 'medium'
      });
      
      return {
        demandForecasting,
        capacityPlanning,
        patientFlowPrediction,
        seasonalAdjustments,
        riskAssessment,
        recommendations,
      };
    } catch (error) {
      throw new Error(`Failed to generate predictive analytics: ${error}`);
    }
  }
}

// Export singleton instance
export const predictiveAnalyticsService = PredictiveAnalyticsService.getInstance();