"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Activity, 
  Award, 
  Users, 
  Calendar, 
  Clock,
  Shield,
  TrendingUp,
  BookOpen,
  Heart,
  Target,
  Stethoscope,
  Info,
  ExternalLink
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

interface ClinicProgramInfoProps {
  participations: ProgramParticipation[]
  compact?: boolean
  showDetailedInfo?: boolean
  onViewProgramDetails?: (programId: string) => void
}

export function ClinicProgramInfo({ 
  participations, 
  compact = false,
  showDetailedInfo = true,
  onViewProgramDetails 
}: ClinicProgramInfoProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PREVENTIVE_CARE':
        return <Shield className="h-4 w-4" />
      case 'CHRONIC_DISEASE_MANAGEMENT':
        return <Heart className="h-4 w-4" />
      case 'HEALTH_SCREENING':
        return <Activity className="h-4 w-4" />
      case 'LIFESTYLE_INTERVENTION':
        return <TrendingUp className="h-4 w-4" />
      case 'MENTAL_HEALTH':
        return <Stethoscope className="h-4 w-4" />
      case 'MATERNAL_CHILD_HEALTH':
        return <Users className="h-4 w-4" />
      case 'ELDERLY_CARE':
        return <Calendar className="h-4 w-4" />
      case 'REHABILITATION':
        return <Target className="h-4 w-4" />
      case 'HEALTH_EDUCATION':
        return <BookOpen className="h-4 w-4" />
      case 'COMMUNITY_HEALTH':
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PREVENTIVE_CARE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CHRONIC_DISEASE_MANAGEMENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HEALTH_SCREENING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'LIFESTYLE_INTERVENTION':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'MENTAL_HEALTH':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'MATERNAL_CHILD_HEALTH':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'ELDERLY_CARE':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'REHABILITATION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HEALTH_EDUCATION':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'COMMUNITY_HEALTH':
        return 'bg-teal-100 text-teal-800 border-teal-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAccreditationBadgeColor = (level: string) => {
    switch (level) {
      case 'CENTER_OF_EXCELLENCE':
        return 'bg-purple-500 text-white'
      case 'RESEARCH_CENTER':
        return 'bg-blue-500 text-white'
      case 'TRAINING_CENTER':
        return 'bg-orange-500 text-white'
      case 'ADVANCED':
        return 'bg-green-500 text-white'
      case 'STANDARD':
        return 'bg-blue-400 text-white'
      case 'BASIC':
        return 'bg-gray-400 text-white'
      case 'SPECIALIZED':
        return 'bg-indigo-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const getTotalPrograms = () => participations.length
  const getActivePrograms = () => participations.filter(p => p.status === 'APPROVED' || p.status === 'ACCREDITED').length
  const getTotalCapacity = () => participations.reduce((sum, p) => sum + (p.capacity.available || 0), 0)

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-green-700">
          <Shield className="h-4 w-4" />
          Healthier SG Programs ({getActivePrograms()}/{getTotalPrograms()})
        </div>
        <div className="grid gap-1">
          {participations.slice(0, 3).map((participation, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-2 bg-green-50 rounded">
              <div className="flex items-center gap-2">
                <div className={cn("p-1 rounded", getCategoryColor(participation.programCategory))}>
                  {getCategoryIcon(participation.programCategory)}
                </div>
                <span className="font-medium truncate">{participation.programName}</span>
              </div>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getAccreditationBadgeColor(participation.accreditationLevel))}
              >
                {participation.accreditationLevel.replace('_', ' ')}
              </Badge>
            </div>
          ))}
          {participations.length > 3 && (
            <div className="text-xs text-center text-muted-foreground">
              +{participations.length - 3} more programs
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Shield className="h-5 w-5" />
          Healthier SG Program Information
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-green-700">
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>{getActivePrograms()} Active Programs</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{getTotalCapacity()} Total Capacity</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {participations.map((participation, index) => (
          <div key={index} className="p-3 bg-white rounded-lg border border-green-200 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-lg", getCategoryColor(participation.programCategory))}>
                  {getCategoryIcon(participation.programCategory)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{participation.programName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatCategory(participation.programCategory)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={cn("text-xs", getAccreditationBadgeColor(participation.accreditationLevel))}>
                  {participation.accreditationLevel.replace('_', ' ')}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", participation.status === 'ACCREDITED' ? 'text-green-700 border-green-300' : 'text-blue-700 border-blue-300')}
                >
                  {participation.status}
                </Badge>
              </div>
            </div>

            {showDetailedInfo && (
              <>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Participation Type:</span>
                      <span className="font-medium">{participation.participationType.replace('_', ' ')}</span>
                    </div>
                    {participation.capacity.limit && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">
                          {participation.capacity.current || 0} / {participation.capacity.limit}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {participation.capacity.available !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className={cn(
                          "font-medium",
                          participation.capacity.available > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {participation.capacity.available} spots
                        </span>
                      </div>
                    )}
                    {participation.capacity.averageWaitTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Wait:</span>
                        <span className="font-medium">{participation.capacity.averageWaitTime} days</span>
                      </div>
                    )}
                  </div>
                </div>

                {participation.capacity.waitingList && participation.capacity.waitingList > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {participation.capacity.waitingList} patients on waiting list
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Info className="h-3 w-3 mr-1" />
                          Program Details
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <div className="font-medium text-xs">{participation.programName}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Click to view detailed program information
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {onViewProgramDetails && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => onViewProgramDetails(participation.programId)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        <Separator className="my-3" />
        
        <div className="flex items-center justify-between text-xs text-green-700">
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>Verified Healthier SG Partner</span>
          </div>
          <div className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export type { ProgramParticipation }