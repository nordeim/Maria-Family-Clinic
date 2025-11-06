"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  CalendarDaysIcon,
  SignalIcon,
  AlertCircleIcon
} from '@heroicons/react/24/outline';
import { WaitTimeEstimation } from '@/hooks/service/use-wait-time-estimator';

interface WaitTimeDisplayProps {
  estimation: WaitTimeEstimation;
  compact?: boolean;
  showDetails?: boolean;
}

export function WaitTimeDisplay({ 
  estimation, 
  compact = false,
  showDetails = true 
}: WaitTimeDisplayProps) {
  const {
    estimatedMinutes,
    confidence,
    factors,
    peakHoursAnalysis,
    realTimeAdjustments,
    capacityAnalysis,
    historicalAccuracy,
  } = estimation;

  const getWaitTimeLevel = (minutes: number) => {
    if (minutes <= 15) return { level: 'low', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (minutes <= 30) return { level: 'moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (minutes <= 60) return { level: 'high', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { level: 'very_high', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const waitTimeLevel = getWaitTimeLevel(estimatedMinutes);
  const confidenceColor = getConfidenceColor(confidence);

  // Calculate peak time impact
  const peakImpact = peakHoursAnalysis?.peakFactor || 1;
  const baseWaitTime = Math.round(estimatedMinutes / peakImpact);

  if (compact) {
    return (
      <div className={`p-3 rounded-lg ${waitTimeLevel.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className={`h-4 w-4 ${waitTimeLevel.color}`} />
            <span className={`font-medium ${waitTimeLevel.color}`}>
              {estimatedMinutes} min wait
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {confidence}% confidence
            </span>
            <Badge 
              variant="outline" 
              className={peakHoursAnalysis?.isPeakHour ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
            >
              {peakHoursAnalysis?.isPeakHour ? 'Peak' : 'Normal'}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          <span>Wait Time Analysis</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Primary Wait Time Display */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${waitTimeLevel.color} mb-2`}>
            {estimatedMinutes}
            <span className="text-lg text-gray-500 ml-1">minutes</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Badge variant="outline" className={`${waitTimeLevel.color} border-current`}>
              {waitTimeLevel.level.toUpperCase()} WAIT
            </Badge>
            <span className="text-sm text-gray-600">
              Confidence: <span className={confidenceColor}>{confidence}%</span>
            </span>
          </div>
          
          {/* Confidence Indicator */}
          <Progress value={confidence} className="w-full max-w-xs mx-auto" />
          <p className="text-xs text-gray-500 mt-2">
            {confidence >= 80 ? 'High confidence prediction' : 
             confidence >= 60 ? 'Moderate confidence prediction' : 
             'Low confidence - estimates may vary'}
          </p>
        </div>

        {showDetails && (
          <>
            {/* Peak Hours Analysis */}
            {peakHoursAnalysis && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  Peak Hours Impact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Current Status</div>
                    <div className="font-medium">
                      {peakHoursAnalysis.isPeakHour ? (
                        <span className="text-orange-600">Peak Hour Active</span>
                      ) : (
                        <span className="text-green-600">Normal Hours</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Peak Factor</div>
                    <div className="font-medium">{peakHoursAnalysis.peakFactor}x</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Peak Level</div>
                    <div className="font-medium capitalize">{peakHoursAnalysis.peakLevel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Crowd Level</div>
                    <div className="font-medium capitalize">{peakHoursAnalysis.crowdLevel}</div>
                  </div>
                </div>
                
                {peakHoursAnalysis.typicalPeakHours.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Typical Peak Hours</div>
                    <div className="flex flex-wrap gap-1">
                      {peakHoursAnalysis.typicalPeakHours.map((hour) => (
                        <Badge key={hour} variant="secondary" className="text-xs">
                          {hour}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Real-time Adjustments */}
            {realTimeAdjustments && realTimeAdjustments.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <SignalIcon className="h-4 w-4 mr-2" />
                  Real-time Adjustments
                </h4>
                <div className="space-y-2">
                  {realTimeAdjustments.map((adjustment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{adjustment.factor}</div>
                        <div className="text-xs text-gray-600 capitalize">{adjustment.type}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          adjustment.impactMinutes > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {adjustment.impactMinutes > 0 ? '+' : ''}{adjustment.impactMinutes} min
                        </div>
                        <div className="text-xs text-gray-500">
                          {adjustment.confidence}% confidence
                        </div>
                      </div>
                      {adjustment.isTemporary && adjustment.expiresAt && (
                        <div className="text-xs text-gray-400 ml-2">
                          Expires {new Date(adjustment.expiresAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity Analysis */}
            {capacityAnalysis && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Capacity Analysis
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Current Load</div>
                    <div className="text-lg font-bold text-purple-600">
                      {capacityAnalysis.currentLoad.capacityUsed}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Available Slots</div>
                    <div className="text-lg font-bold text-green-600">
                      {capacityAnalysis.currentLoad.availableSlots}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Booked</div>
                    <div className="text-lg font-bold text-orange-600">
                      {capacityAnalysis.currentLoad.bookedSlots}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Waitlist</div>
                    <div className="text-lg font-bold text-red-600">
                      {capacityAnalysis.currentLoad.waitingListCount}
                    </div>
                  </div>
                </div>
                
                {/* Projected Load */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-600">Next Hour</div>
                    <div className="text-sm font-medium">
                      {capacityAnalysis.projectedLoad.nextHour}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Next 2 Hours</div>
                    <div className="text-sm font-medium">
                      {capacityAnalysis.projectedLoad.nextTwoHours}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Today</div>
                    <div className="text-sm font-medium">
                      {capacityAnalysis.projectedLoad.today}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wait Time Factors */}
            {factors && factors.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircleIcon className="h-4 w-4 mr-2" />
                  Contributing Factors
                </h4>
                <div className="space-y-3">
                  {factors
                    .sort((a, b) => Math.abs(b.baseImpactMinutes * b.currentMultiplier) - 
                              Math.abs(a.baseImpactMinutes * a.currentMultiplier))
                    .slice(0, 5)
                    .map((factor, index) => {
                      const totalImpact = factor.baseImpactMinutes * factor.currentMultiplier;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{factor.name}</div>
                            <div className="text-xs text-gray-600">{factor.description}</div>
                            <div className="flex items-center mt-1">
                              <Progress 
                                value={factor.weight * 100} 
                                className="w-16 h-1 mr-2"
                              />
                              <span className="text-xs text-gray-500">
                                Weight: {Math.round(factor.weight * 100)}%
                              </span>
                            </div>
                          </div>
                          <div className={`text-right ${
                            totalImpact > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            <div className="text-sm font-medium">
                              {totalImpact > 0 ? '+' : ''}{Math.round(totalImpact)} min
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {factor.category}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Historical Accuracy */}
            {historicalAccuracy && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Prediction Accuracy</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Overall Accuracy</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {historicalAccuracy.accuracy}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Sample Size</div>
                    <div className="text-lg font-bold">
                      {historicalAccuracy.sampleSize}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg. Error</div>
                    <div className="text-lg font-bold">
                      ±{historicalAccuracy.averageError} min
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-600">
                  Last validated: {new Date(historicalAccuracy.lastValidation).toLocaleString()}
                </div>
              </div>
            )}
          </>
        )}

        {/* Base Wait Time (without peak factor) */}
        {peakImpact > 1.1 && (
          <div className="border-t pt-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Base Wait Time (non-peak)</div>
              <div className="text-2xl font-bold text-gray-700">
                {baseWaitTime} minutes
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}