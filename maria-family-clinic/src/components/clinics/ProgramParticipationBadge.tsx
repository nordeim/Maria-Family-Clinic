"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award,
  Users,
  Activity,
  AlertCircle,
  Info
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

interface ProgramParticipationBadgeProps {
  participations: ProgramParticipation[]
  compact?: boolean
}

export function ProgramParticipationBadge({ participations, compact = false }: ProgramParticipationBadgeProps) {
  const getParticipationTypeIcon = (type: string) => {
    switch (type) {
      case 'FULL_PARTICIPATION':
        return <CheckCircle className="h-3 w-3" />
      case 'SELECTED_SERVICES':
        return <Activity className="h-3 w-3" />
      case 'CENTER_OF_EXCELLENCE':
        return <Award className="h-3 w-3" />
      case 'RESEARCH_CENTER':
        return <TrendingUp className="h-3 w-3" />
      case 'TRAINING_CENTER':
        return <Users className="h-3 w-3" />
      default:
        return <CheckCircle className="h-3 w-3" />
    }
  }

  const getParticipationTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_PARTICIPATION':
        return 'Full'
      case 'SELECTED_SERVICES':
        return 'Selected'
      case 'PILOT_PROGRAM':
        return 'Pilot'
      case 'RESEARCH_PARTICIPANT':
        return 'Research'
      case 'TRAINING_CENTER':
        return 'Training'
      case 'REFERRAL_PARTNER':
        return 'Referral'
      case 'COLLABORATIVE_CARE':
        return 'Collaborative'
      default:
        return type.replace('_', ' ')
    }
  }

  const getAccreditationColor = (level: string) => {
    switch (level) {
      case 'CENTER_OF_EXCELLENCE':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'RESEARCH_CENTER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'TRAINING_CENTER':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'ADVANCED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'STANDARD':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'BASIC':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'SPECIALIZED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {participations.slice(0, 2).map((participation, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs gap-1",
                    getAccreditationColor(participation.accreditationLevel)
                  )}
                >
                  {getParticipationTypeIcon(participation.participationType)}
                  {getParticipationTypeLabel(participation.participationType)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">{participation.programName}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCategory(participation.programCategory)}
                  </div>
                  <div className="text-xs mt-1">
                    {participation.accreditationLevel.replace('_', ' ')}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {participations.length > 2 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-xs">
                  +{participations.length - 2} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">Additional Programs</div>
                  {participations.slice(2).map((participation, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {participation.programName}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {participations.map((participation, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {getParticipationTypeIcon(participation.participationType)}
              <span className="text-sm font-medium">{participation.programName}</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn("text-xs", getAccreditationColor(participation.accreditationLevel))}
            >
              {participation.accreditationLevel.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {participation.capacity.available !== null && (
              <div className="flex items-center gap-1 text-xs">
                {participation.capacity.available > 0 ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                )}
                <span className={cn(
                  participation.capacity.available > 0 ? "text-green-600" : "text-orange-600"
                )}>
                  {participation.capacity.available > 0 ? `${participation.capacity.available} spots` : 'At capacity'}
                </span>
              </div>
            )}
            
            {participation.capacity.averageWaitTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{participation.capacity.averageWaitTime} days</span>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {participations.length > 1 && (
        <div className="text-xs text-muted-foreground text-center">
          Participating in {participations.length} Healthier SG program{participations.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export type { ProgramParticipation }