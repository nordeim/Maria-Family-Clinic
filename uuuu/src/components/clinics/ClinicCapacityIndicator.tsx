"use client"

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Calendar,
  Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgramParticipation {
  programId: string
  programName: string
  programCategory: string
  participationType: string
  accreditationLevel: string
  status: string
  capacity: {
    limit: number | null
    current: number | null
    waitingList: number | null
    available: number | null
    averageWaitTime: number | null
    lastUpdated?: Date
  }
}

interface ClinicCapacityIndicatorProps {
  participations: ProgramParticipation[]
  showUtilization?: boolean
  compact?: boolean
}

export function ClinicCapacityIndicator({ 
  participations, 
  showUtilization = true,
  compact = false 
}: ClinicCapacityIndicatorProps) {
  const getCapacityStatus = (participation: ProgramParticipation) => {
    const { capacity } = participation
    if (!capacity.limit || capacity.limit === 0) {
      return { status: 'unlimited', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    }
    
    const utilizationRate = capacity.limit > 0 ? (capacity.current || 0) / capacity.limit * 100 : 0
    const available = capacity.available || 0
    
    if (utilizationRate >= 90) {
      return { status: 'full', color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (utilizationRate >= 70) {
      return { status: 'busy', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    } else if (available === 0) {
      return { status: 'waiting_list', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    } else {
      return { status: 'available', color: 'text-green-600', bgColor: 'bg-green-100' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-3 w-3" />
      case 'busy':
        return <Activity className="h-3 w-3" />
      case 'full':
        return <AlertTriangle className="h-3 w-3" />
      case 'waiting_list':
        return <Clock className="h-3 w-3" />
      case 'unlimited':
        return <TrendingUp className="h-3 w-3" />
      default:
        return <CheckCircle className="h-3 w-3" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'busy':
        return 'Busy'
      case 'full':
        return 'At Capacity'
      case 'waiting_list':
        return 'Waitlist'
      case 'unlimited':
        return 'Open'
      default:
        return 'Unknown'
    }
  }

  const formatLastUpdated = (date?: Date) => {
    if (!date) return null
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {participations.slice(0, 2).map((participation, index) => {
          const capacityStatus = getCapacityStatus(participation)
          
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center justify-between p-2 rounded-lg border",
                    capacityStatus.bgColor
                  )}>
                    <div className="flex items-center gap-2">
                      <div className={cn("text-xs", capacityStatus.color)}>
                        {getStatusIcon(capacityStatus.status)}
                      </div>
                      <span className="text-xs font-medium truncate">
                        {participation.programName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {participation.capacity.available !== null && (
                        <span className={capacityStatus.color}>
                          {participation.capacity.available > 0 ? 
                            `${participation.capacity.available}` : '0`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div className="font-medium text-xs">{participation.programName}</div>
                    {participation.capacity.limit && participation.capacity.limit > 0 && (
                      <div className="text-xs">
                        Capacity: {participation.capacity.current || 0}/{participation.capacity.limit}
                      </div>
                    )}
                    {participation.capacity.averageWaitTime && (
                      <div className="text-xs">
                        Avg wait: {participation.capacity.averageWaitTime} days
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Status: {getStatusLabel(capacityStatus.status)}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {participations.map((participation, index) => {
        const capacityStatus = getCapacityStatus(participation)
        const utilizationRate = participation.capacity.limit && participation.capacity.limit > 0 
          ? ((participation.capacity.current || 0) / participation.capacity.limit) * 100 
          : 0
        
        return (
          <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("flex items-center gap-1", capacityStatus.color)}>
                  {getStatusIcon(capacityStatus.status)}
                  <span className="text-sm font-medium">{participation.programName}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {participation.participationType.replace('_', ' ')}
                </Badge>
              </div>
              <Badge className={cn("text-xs", capacityStatus.bgColor, capacityStatus.color)}>
                {getStatusLabel(capacityStatus.status)}
              </Badge>
            </div>

            {showUtilization && participation.capacity.limit && participation.capacity.limit > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Capacity Utilization</span>
                  <span className="font-medium">
                    {participation.capacity.current || 0} / {participation.capacity.limit}
                  </span>
                </div>
                <Progress 
                  value={utilizationRate} 
                  className="h-2"
                  style={{
                    '--progress-background': capacityStatus.color.includes('red') ? '#ef4444' :
                                           capacityStatus.color.includes('orange') ? '#f97316' :
                                           capacityStatus.color.includes('yellow') ? '#eab308' :
                                           '#22c55e'
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{utilizationRate.toFixed(0)}% utilized</span>
                  <span>{participation.capacity.available || 0} spots remaining</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                {participation.capacity.waitingList && participation.capacity.waitingList > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{participation.capacity.waitingList} waiting</span>
                  </div>
                )}
                {participation.capacity.averageWaitTime && (
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    <span>{participation.capacity.averageWaitTime} days avg wait</span>
                  </div>
                )}
              </div>
              {formatLastUpdated(participation.capacity.lastUpdated) && (
                <span>Updated {formatLastUpdated(participation.capacity.lastUpdated)}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export type { ProgramParticipation }