"use client";

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { SchedulingConflict } from '@/lib/service/conflict-resolution';

interface ConflictResolutionNotificationProps {
  conflict: SchedulingConflict;
  onDismiss: () => void;
  onResolve?: (resolution: any) => void;
  autoResolve?: boolean;
  showActions?: boolean;
}

export function ConflictResolutionNotification({
  conflict,
  onDismiss,
  onResolve,
  autoResolve = false,
  showActions = true,
}: ConflictResolutionNotificationProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [resolution, setResolution] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (autoResolve) {
      handleAutoResolve();
    }
  }, [conflict]);

  const handleAutoResolve = async () => {
    setIsResolving(true);
    try {
      // Simulate automatic resolution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResolution = {
        success: true,
        action: 'reschedule',
        newSlotId: 'auto-resolved-slot',
        message: 'Automatically resolved and rescheduled',
      };
      
      setResolution(mockResolution);
      if (onResolve) {
        onResolve(mockResolution);
      }
    } catch (error) {
      console.error('Auto-resolution failed:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleManualResolve = async () => {
    setIsResolving(true);
    try {
      // Simulate manual resolution process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResolution = {
        success: true,
        action: 'conflict_handled',
        message: 'Manual intervention completed',
      };
      
      setResolution(mockResolution);
      if (onResolve) {
        onResolve(mockResolution);
      }
    } catch (error) {
      console.error('Manual resolution failed:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const getSeverityDisplay = () => {
    switch (conflict.severity) {
      case 'critical':
        return {
          variant: 'destructive' as const,
          icon: ExclamationTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'CRITICAL',
        };
      case 'high':
        return {
          variant: 'destructive' as const,
          icon: ExclamationTriangleIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'HIGH PRIORITY',
        };
      case 'medium':
        return {
          variant: 'default' as const,
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'MEDIUM PRIORITY',
        };
      case 'low':
        return {
          variant: 'secondary' as const,
          icon: InformationCircleIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'LOW PRIORITY',
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: InformationCircleIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'INFO',
        };
    }
  };

  const getConflictTypeDisplay = () => {
    const typeMap = {
      'time_overlap': { label: 'Time Overlap', description: 'Appointments scheduled at overlapping times' },
      'double_booking': { label: 'Double Booking', description: 'Same time slot booked by multiple patients' },
      'capacity_exceeded': { label: 'Capacity Exceeded', description: 'More appointments than available capacity' },
      'doctor_unavailable': { label: 'Doctor Unavailable', description: 'Scheduled doctor not available' },
      'equipment_unavailable': { label: 'Equipment Unavailable', description: 'Required equipment not available' },
      'emergency_override': { label: 'Emergency Override', description: 'Emergency case requiring immediate attention' },
    };

    const typeInfo = typeMap[conflict.type.category] || {
      label: conflict.type.category.replace('_', ' ').toUpperCase(),
      description: 'Scheduling conflict detected',
    };

    return typeInfo;
  };

  const getImpactIcon = () => {
    const { medicalRisk, operationalDisruption } = conflict.impactAnalysis;
    
    if (medicalRisk !== 'none') {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
    
    if (operationalDisruption === 'severe') {
      return <ClockIcon className="h-4 w-4 text-orange-500" />;
    }
    
    return <InformationCircleIcon className="h-4 w-4 text-blue-500" />;
  };

  if (isDismissed) return null;

  const severityDisplay = getSeverityDisplay();
  const typeDisplay = getConflictTypeDisplay();
  const SeverityIcon = severityDisplay.icon;

  return (
    <div className={`transition-all duration-300 ${
      isDismissed ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
    }`}>
      <Alert className={`${severityDisplay.bgColor} ${severityDisplay.borderColor} border-l-4`}>
        <div className="flex items-start space-x-3">
          <div className="flex items-center space-x-2">
            <SeverityIcon className={`h-5 w-5 ${severityDisplay.color} mt-0.5`} />
            <Badge variant={severityDisplay.variant} className="text-xs">
              {severityDisplay.label}
            </Badge>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900">{typeDisplay.label}</h4>
              {getImpactIcon()}
            </div>
            
            <AlertDescription className="text-sm text-gray-700 mb-3">
              {conflict.description}
            </AlertDescription>

            {/* Conflict Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <span className="font-medium text-gray-600">Detected:</span>
                <div className="text-gray-800">
                  {new Date(conflict.detectedAt).toLocaleString()}
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Affected Patients:</span>
                <div className="text-gray-800">
                  {conflict.impactAnalysis.affectedPatients.length}
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Resolution Time:</span>
                <div className="text-gray-800">
                  ~{conflict.impactAnalysis.estimatedResolutionTime} min
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Priority Score:</span>
                <div className="text-gray-800">{conflict.priority}</div>
              </div>
            </div>

            {/* Risk Indicators */}
            {(conflict.impactAnalysis.medicalRisk !== 'none' || conflict.impactAnalysis.operationalDisruption !== 'none') && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {conflict.impactAnalysis.medicalRisk !== 'none' && (
                    <Badge variant="destructive" className="text-xs">
                      Medical Risk: {conflict.impactAnalysis.medicalRisk}
                    </Badge>
                  )}
                  {conflict.impactAnalysis.operationalDisruption !== 'none' && (
                    <Badge variant="outline" className="text-xs">
                      {conflict.impactAnalysis.operationalDisruption} Disruption
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Resolution Status */}
            {resolution ? (
              <div className={`p-3 rounded border ${
                resolution.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {resolution.success ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {resolution.success ? 'Resolved' : 'Resolution Failed'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{resolution.message}</p>
              </div>
            ) : isResolving ? (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <ArrowPathIcon className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-900">
                  {autoResolve ? 'Automatically resolving...' : 'Resolving conflict...'}
                </span>
              </div>
            ) : null}

            {/* Action Buttons */}
            {showActions && !resolution && (
              <div className="flex items-center space-x-2 mt-4">
                {!autoResolve && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualResolve}
                    disabled={isResolving}
                  >
                    {isResolving ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                        Resolving...
                      </>
                    ) : (
                      'Resolve Conflict'
                    )}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  disabled={isResolving}
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}