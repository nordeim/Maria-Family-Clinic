"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface WaitTimeEstimation {
  serviceId: string;
  clinicId: string;
  doctorId?: string;
  
  // Basic estimation
  estimatedMinutes: number;
  confidence: number; // 0-100
  
  // Detailed breakdown
  factors: WaitTimeFactor[];
  
  // Peak time analysis
  peakHoursAnalysis: PeakHoursAnalysis;
  
  // Real-time adjustments
  realTimeAdjustments: RealTimeAdjustment[];
  
  // Capacity analysis
  capacityAnalysis: CapacityAnalysis;
  
  // Historical data reference
  historicalAccuracy: HistoricalAccuracy;
  
  // Next update
  lastCalculated: string;
  nextCalculation: string;
}

export interface WaitTimeFactor {
  id: string;
  category: 'clinic' | 'service' | 'time' | 'seasonal' | 'emergency';
  name: string;
  description: string;
  
  // Impact calculation
  baseImpactMinutes: number; // Positive or negative
  currentMultiplier: number; // 0.5 to 2.0
  weight: number; // 0-1
  
  // Dynamic properties
  isDynamic: boolean;
  lastUpdated: string;
  
  // Source information
  source: 'historical' | 'real_time' | 'scheduled' | 'estimated';
}

export interface PeakHoursAnalysis {
  isPeakHour: boolean;
  peakLevel: 'low' | 'moderate' | 'high' | 'extreme';
  peakFactor: number; // Multiplier for peak times
  nextPeakStart?: string;
  nextPeakEnd?: string;
  peakProbability: number; // 0-100
  
  // Historical peak patterns
  typicalPeakHours: string[]; // ['09:00', '14:00', '18:00']
  peakDuration: number; // minutes
  
  // Crowd management indicators
  crowdLevel: 'sparse' | 'normal' | 'busy' | 'crowded' | 'overcapacity';
  estimatedQueueTime: number; // additional minutes due to crowd
}

export interface RealTimeAdjustment {
  factor: string;
  currentValue: number;
  baselineValue: number;
  impactMinutes: number;
  
  // Duration of impact
  isTemporary: boolean;
  estimatedDuration?: number; // minutes
  expiresAt?: string;
  
  // Type of real-time factor
  type: 'weather' | 'emergency' | 'staff_availability' | 'equipment_issue' | 'special_event' | 'medical_emergency';
  
  // Confidence in this adjustment
  confidence: number; // 0-100
}

export interface CapacityAnalysis {
  currentLoad: {
    capacityUsed: number; // 0-100 percentage
    totalCapacity: number;
    availableSlots: number;
    bookedSlots: number;
    waitingListCount: number;
  };
  
  // Time-based capacity
  projectedLoad: {
    nextHour: number;
    nextTwoHours: number;
    today: number;
  };
  
  // Staff capacity
  staffCapacity: {
    availableStaff: number;
    requiredStaff: number;
    staffEfficiency: number; // 0-100
    burnoutRisk: number; // 0-100
  };
  
  // Equipment capacity
  equipmentCapacity: {
    availableEquipment: number;
    requiredEquipment: number;
    maintenanceOverhead: number; // percentage
  };
}

export interface HistoricalAccuracy {
  accuracy: number; // 0-100 percentage
  sampleSize: number; // Number of historical data points
  averageError: number; // Minutes
  lastValidation: string;
  
  // Accuracy by time period
  timeOfDayAccuracy: Record<string, number>; // '09:00' -> accuracy%
  dayOfWeekAccuracy: Record<string, number>; // 'Monday' -> accuracy%
  
  // Accuracy trends
  trendDirection: 'improving' | 'stable' | 'declining';
  lastTrendUpdate: string;
}

export interface CapacityPlanning {
  recommendations: CapacityRecommendation[];
  optimalScheduling: OptimalScheduling[];
  bottleneckAnalysis: BottleneckAnalysis[];
  scalingOpportunities: ScalingOpportunity[];
}

export interface CapacityRecommendation {
  id: string;
  type: 'add_staff' | 'extend_hours' | 'optimize_schedule' | 'add_capacity' | 'implement_tech';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedImpact: {
    waitTimeReduction: number; // percentage
    capacityIncrease: number; // percentage
    costImpact: number; // +/-$ per month
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string; // e.g., "2-4 weeks"
    dependencies: string[];
  };
}

export interface OptimalScheduling {
  timeSlot: string;
  recommendedStaff: number;
  expectedUtilization: number; // 0-100
  estimatedWaitTime: number; // minutes
  profitabilityScore: number; // 0-100
  patientSatisfactionScore: number; // 0-100
}

export interface BottleneckAnalysis {
  area: string; // e.g., "registration", "consultation", "laboratory"
  bottleneckSeverity: 'minor' | 'moderate' | 'severe' | 'critical';
  impactMinutes: number;
  contributingFactors: string[];
  recommendedSolutions: string[];
  implementationPriority: number;
}

export interface ScalingOpportunity {
  area: string;
  currentCapacity: number;
  potentialCapacity: number;
  scalingFactor: number;
  investmentRequired: number;
  roiTimeframe: string; // e.g., "6 months"
  riskLevel: 'low' | 'medium' | 'high';
}

interface UseWaitTimeEstimatorOptions {
  serviceId: string;
  clinicId: string;
  doctorId?: string;
  includeCapacityPlanning?: boolean;
  updateInterval?: number; // milliseconds
  enableRealTimeAdjustments?: boolean;
}

export function useWaitTimeEstimator(options: UseWaitTimeEstimatorOptions) {
  const {
    serviceId,
    clinicId,
    doctorId,
    includeCapacityPlanning = false,
    updateInterval = 60000, // 1 minute
    enableRealTimeAdjustments = true,
  } = options;

  const [lastCalculation, setLastCalculation] = useState<string>(new Date().toISOString());
  const [isCalculating, setIsCalculating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch wait time estimation
  const {
    data: estimation,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['wait-time-estimate', serviceId, clinicId, doctorId, includeCapacityPlanning],
    queryFn: async (): Promise<WaitTimeEstimation> => {
      const params = new URLSearchParams({
        serviceId,
        clinicId,
        ...(doctorId && { doctorId }),
        ...(includeCapacityPlanning && { includeCapacityPlanning: 'true' }),
      });

      const response = await fetch(`/api/wait-time-estimate?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wait time estimate');
      }

      const result = await response.json();
      setLastCalculation(new Date().toISOString());
      return result;
    },
    refetchInterval: updateInterval,
    staleTime: 30000, // 30 seconds
  });

  // Calculate wait time on-demand
  const calculateWaitTime = useCallback(async (): Promise<WaitTimeEstimation | null> => {
    setIsCalculating(true);
    try {
      const params = new URLSearchParams({
        serviceId,
        clinicId,
        ...(doctorId && { doctorId }),
        force: 'true', // Force calculation
      });

      const response = await fetch(`/api/wait-time-estimate/calculate?${params}`);
      if (!response.ok) {
        throw new Error('Failed to calculate wait time');
      }

      const result = await response.json();
      setLastCalculation(new Date().toISOString());
      return result;
    } catch (error) {
      console.error('Failed to calculate wait time:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [serviceId, clinicId, doctorId]);

  // Get peak time information
  const getPeakTimeInfo = useCallback(() => {
    if (!estimation?.peakHoursAnalysis) return null;

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const isCurrentlyPeak = estimation.peakHoursAnalysis.isPeakHour;
    const peakLevel = estimation.peakHoursAnalysis.peakLevel;

    return {
      isCurrentlyPeak,
      peakLevel,
      nextPeakStart: estimation.peakHoursAnalysis.nextPeakStart,
      peakProbability: estimation.peakHoursAnalysis.peakProbability,
    };
  }, [estimation]);

  // Get real-time adjustments summary
  const getRealTimeAdjustments = useCallback(() => {
    if (!estimation?.realTimeAdjustments) return [];

    return estimation.realTimeAdjustments.map(adjustment => ({
      factor: adjustment.factor,
      impactMinutes: adjustment.impactMinutes,
      isTemporary: adjustment.isTemporary,
      confidence: adjustment.confidence,
      type: adjustment.type,
      expiresAt: adjustment.expiresAt,
    }));
  }, [estimation]);

  // Calculate confidence-based wait time range
  const getWaitTimeRange = useCallback(() => {
    if (!estimation) return null;

    const { estimatedMinutes, confidence } = estimation;

    // Calculate range based on confidence
    const confidenceMultiplier = confidence / 100;
    const rangeSize = (1 - confidenceMultiplier) * 30; // Max 30 minutes range
    const minWait = Math.max(0, estimatedMinutes - rangeSize / 2);
    const maxWait = estimatedMinutes + rangeSize / 2;

    return {
      min: Math.round(minWait),
      max: Math.round(maxWait),
      average: estimatedMinutes,
      confidence,
    };
  }, [estimation]);

  // Get capacity utilization
  const getCapacityUtilization = useCallback(() => {
    if (!estimation?.capacityAnalysis) return null;

    const { currentLoad } = estimation.capacityAnalysis;

    let utilizationLevel: 'low' | 'moderate' | 'high' | 'critical';
    if (currentLoad.capacityUsed < 50) {
      utilizationLevel = 'low';
    } else if (currentLoad.capacityUsed < 75) {
      utilizationLevel = 'moderate';
    } else if (currentLoad.capacityUsed < 90) {
      utilizationLevel = 'high';
    } else {
      utilizationLevel = 'critical';
    }

    return {
      percentage: currentLoad.capacityUsed,
      level: utilizationLevel,
      availableSlots: currentLoad.availableSlots,
      totalSlots: currentLoad.totalCapacity,
      bookedSlots: currentLoad.bookedSlots,
    };
  }, [estimation]);

  // Get wait time factors breakdown
  const getFactorsBreakdown = useCallback(() => {
    if (!estimation?.factors) return [];

    return estimation.factors
      .map(factor => ({
        ...factor,
        totalImpact: factor.baseImpactMinutes * factor.currentMultiplier * factor.weight,
      }))
      .sort((a, b) => Math.abs(b.totalImpact) - Math.abs(a.totalImpact));
  }, [estimation]);

  // Auto-calculate on interval
  useEffect(() => {
    if (enableRealTimeAdjustments) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, updateInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enableRealTimeAdjustments, updateInterval, refetch]);

  return {
    // Data
    estimation,
    isLoading,
    error,
    isCalculating,
    lastCalculation,

    // Actions
    calculateWaitTime,
    refetch,

    // Computed data
    getPeakTimeInfo,
    getRealTimeAdjustments,
    getWaitTimeRange,
    getCapacityUtilization,
    getFactorsBreakdown,

    // Status indicators
    hasData: !!estimation,
    isStale: estimation ? Date.now() - new Date(estimation.lastCalculated).getTime() > updateInterval : true,
    needsUpdate: estimation ? Date.now() - new Date(estimation.lastCalculated).getTime() > updateInterval / 2 : false,
  };
}