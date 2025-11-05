"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Shield, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Star,
  Award,
  Zap,
  Activity,
  Heart,
  AlertCircle,
  Info,
  TrendingUp,
  Target,
  Users,
  Calendar,
  MapPin,
  Stethoscope,
  FileText,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgramServiceTagProps extends React.HTMLAttributes<HTMLDivElement> {
  // Service information
  serviceId: string
  serviceName: string
  category: string
  basePrice?: number
  programPrice?: number
  duration?: number
  isProgramCovered: boolean

  // Healthier SG Program integration
  programInfo?: {
    programId: string
    programName: string
    participationType: 'FULL_PARTICIPATION' | 'SELECTED_SERVICES' | 'PILOT_PROGRAM'
    accreditationLevel: 'BASIC' | 'STANDARD' | 'ADVANCED' | 'SPECIALIZED' | 'CENTER_OF_EXCELLENCE'
    benefits?: Array<{
      type: string
      description: string
      amount?: number
      coveragePercentage?: number
      isAutomatic: boolean
    }>
    eligibilityCriteria?: string[]
    successMetrics?: {
      completionRate: number
      patientSatisfaction: number
      averageWaitTime: number
      complicationRate: number
    }
    waitingListInfo?: {
      current: number
      averageWaitTime: number
      nextAvailable: Date
      isAccepting: boolean
    }
  }

  // Clinic integration
  availableClinics?: Array<{
    id: string
    name: string
    address: string
    rating?: number
    distance?: number
    isHealthierSGParticipating: boolean
    programCapacity?: {
      available: number
      limit: number
    }
    nextAvailable?: Date
    waitTime?: number
  }>

  // Doctor integration
  availableDoctors?: Array<{
    id: string
    name: string
    specialization: string
    rating: number
    isHealthierSGCertified: boolean
    programExperience: number
    nextAvailable: Date
    consultationFee?: number
    programFee?: number
  }>

  // Benefits and coverage
  benefits?: Array<{
    type: 'SUBSIDY' | 'DISCOUNT' | 'REIMBURSEMENT' | 'PREVENTIVE_SCREENING' | 'HEALTHCARE_SERVICE'
    description: string
    amount?: number
    percentage?: number
    isAutomatic: boolean
    requiresApproval: boolean
  }>

  // Actions
  onViewDetails?: (serviceId: string) => void
  onBookService?: (serviceId: string, clinicId?: string) => void
  onViewProgramInfo?: (programId: string) => void
  onComparePrices?: (serviceId: string) => void
  onCheckEligibility?: (serviceId: string) => void

  // Display options
  showPrice?: boolean
  showBenefits?: boolean
  showClinics?: boolean
  showDoctors?: boolean
  showMetrics?: boolean
  compact?: boolean
  variant?: 'default' | 'price-focused' | 'benefit-focused' | 'availability-focused'
  interactive?: boolean
}

export function ProgramServiceTag({
  serviceId,
  serviceName,
  category,
  basePrice,
  programPrice,
  duration,
  isProgramCovered,

  // Program integration
  programInfo,

  // Clinic integration
  availableClinics = [],

  // Doctor integration
  availableDoctors = [],

  // Benefits
  benefits = [],

  // Actions
  onViewDetails,
  onBookService,
  onViewProgramInfo,
  onComparePrices,
  onCheckEligibility,

  // Display options
  showPrice = true,
  showBenefits = true,
  showClinics = true,
  showDoctors = true,
  showMetrics = true,
  compact = false,
  variant = 'default',
  interactive = true,

  className,
  ...props
}: ProgramServiceTagProps) {
  const handleViewDetails = () => {
    onViewDetails?.(serviceId)
  }

  const handleBookService = (clinicId?: string) => {
    onBookService?.(serviceId, clinicId)
  }

  const handleViewProgramInfo = () => {
    onViewProgramInfo?.(programInfo?.programId || serviceId)
  }

  const handleComparePrices = () => {
    onComparePrices?.(serviceId)
  }

  const handleCheckEligibility = () => {
    onCheckEligibility?.(serviceId)
  }

  const getAccreditationColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'center_of_excellence': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'specialized': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200'
      case 'standard': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'basic': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getParticipationTypeIcon = (type: string) => {
    switch (type) {
      case 'FULL_PARTICIPATION': return <Shield className="h-3 w-3" />
      case 'SELECTED_SERVICES': return <CheckCircle className="h-3 w-3" />
      case 'PILOT_PROGRAM': return <Zap className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  const getBenefitIcon = (type: string) => {
    switch (type) {
      case 'SUBSIDY': return <DollarSign className="h-3 w-3" />
      case 'DISCOUNT': return <TrendingUp className="h-3 w-3" />
      case 'REIMBURSEMENT': return <FileText className="h-3 w-3" />
      case 'PREVENTIVE_SCREENING': return <Target className="h-3 w-3" />
      case 'HEALTHCARE_SERVICE': return <Heart className="h-3 w-3" />
      default: return <Info className="h-3 w-3" />
    }
  }

  const programClinics = availableClinics.filter(c => c.isHealthierSGParticipating)
  const certifiedDoctors = availableDoctors.filter(d => d.isHealthierSGCertified)

  return (
    <Card
      className={cn(
        "group transition-all hover:shadow-md border",
        isProgramCovered && "border-green-200 bg-green-50/30",
        programInfo && "border-blue-200",
        variant === 'price-focused' && "ring-2 ring-green-200",
        variant === 'benefit-focused' && "ring-2 ring-blue-200",
        variant === 'availability-focused' && "ring-2 ring-purple-200",
        compact && "p-3",
        className
      )}
      {...props}
    >
      <CardContent className={cn("space-y-3", compact && "space-y-2")}>
        {/* Service Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn("font-semibold", compact ? "text-sm" : "text-base")}>
                {serviceName}
              </h3>
              
              {isProgramCovered && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Program Covered
                </Badge>
              )}
              
              {programInfo && (
                <Badge variant="outline" className={getAccreditationColor(programInfo.accreditationLevel)}>
                  {getParticipationTypeIcon(programInfo.participationType)}
                  <span className="ml-1">{programInfo.accreditationLevel}</span>
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">{category}</div>
            
            {duration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>{duration} minutes</span>
              </div>
            )}
          </div>
          
          {interactive && onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDetails}
              className="shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Pricing Information */}
        {showPrice && (basePrice || programPrice) && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </h4>
            <div className="space-y-2">
              {programPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 font-medium">Program Price:</span>
                  <span className="font-bold text-green-800">${programPrice}</span>
                </div>
              )}
              {basePrice && programPrice && basePrice !== programPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Regular Price:</span>
                  <span className="text-gray-500 line-through">${basePrice}</span>
                </div>
              )}
              {programPrice && basePrice && programPrice < basePrice && (
                <div className="text-sm text-green-600 font-medium">
                  You save: ${(basePrice - programPrice).toFixed(2)}
                </div>
              )}
            </div>
            
            {onComparePrices && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleComparePrices}
                className="w-full mt-2"
              >
                Compare Prices
              </Button>
            )}
          </div>
        )}

        {/* Program Benefits */}
        {showBenefits && isProgramCovered && (benefits.length > 0 || programInfo?.benefits) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              Program Benefits
            </h4>
            <div className="space-y-2">
              {(benefits.length > 0 ? benefits : programInfo?.benefits || []).map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <div className="shrink-0 mt-0.5">
                    {getBenefitIcon(benefit.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{benefit.description}</div>
                    {benefit.amount && (
                      <div className="text-sm text-green-600 font-medium">
                        ${benefit.amount}
                      </div>
                    )}
                    {benefit.percentage && (
                      <div className="text-sm text-green-600 font-medium">
                        {benefit.percentage}% coverage
                      </div>
                    )}
                  </div>
                  {benefit.isAutomatic ? (
                    <Badge variant="default" className="text-xs">
                      Auto
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Manual
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Program Metrics */}
        {showMetrics && programInfo?.successMetrics && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Program Performance
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-gray-600">Completion Rate</div>
                <div className="font-semibold text-purple-800">
                  {programInfo.successMetrics.completionRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Patient Satisfaction</div>
                <div className="font-semibold text-purple-800">
                  {programInfo.successMetrics.patientSatisfaction}/5
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Avg. Wait Time</div>
                <div className="font-semibold text-purple-800">
                  {programInfo.successMetrics.averageWaitTime}d
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Complication Rate</div>
                <div className="font-semibold text-purple-800">
                  {programInfo.successMetrics.complicationRate}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Clinics */}
        {showClinics && programClinics.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              Available Clinics
            </h4>
            <div className="space-y-2">
              {programClinics.slice(0, compact ? 2 : 3).map((clinic) => (
                <div key={clinic.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {clinic.name}
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Healthier SG
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">{clinic.address}</div>
                    {clinic.rating && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span>{clinic.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {clinic.programCapacity && (
                      <div className="text-xs text-gray-600">
                        {clinic.programCapacity.available}/{clinic.programCapacity.limit} slots
                      </div>
                    )}
                    {onBookService && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 mt-1"
                        onClick={() => handleBookService(clinic.id)}
                      >
                        Book
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Doctors */}
        {showDoctors && certifiedDoctors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-green-600" />
              Certified Doctors
            </h4>
            <div className="space-y-2">
              {certifiedDoctors.slice(0, compact ? 1 : 2).map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      Dr. {doctor.name}
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">{doctor.specialization}</div>
                    <div className="text-xs text-gray-500">
                      {doctor.programExperience} years program experience
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span>{doctor.rating}</span>
                    </div>
                    {doctor.programFee && (
                      <div className="text-xs text-green-600 font-medium">
                        ${doctor.programFee}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting List Information */}
        {programInfo?.waitingListInfo && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Availability
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current queue:</span>
                <span className="font-medium">{programInfo.waitingListInfo.current} patients</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. wait time:</span>
                <span className="font-medium">{programInfo.waitingListInfo.averageWaitTime} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next available:</span>
                <span className="font-medium">
                  {programInfo.waitingListInfo.nextAvailable.toLocaleDateString()}
                </span>
              </div>
            </div>
            {!programInfo.waitingListInfo.isAccepting && (
              <div className="flex items-center gap-2 text-yellow-700 mt-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Not currently accepting new patients</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onCheckEligibility && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={handleCheckEligibility}
              className="flex-1"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Check Eligibility
            </Button>
          )}
          
          {onBookService && (
            <Button
              size={compact ? "sm" : "default"}
              onClick={() => handleBookService()}
              className={cn(
                "flex-1",
                isProgramCovered && "bg-green-600 hover:bg-green-700"
              )}
            >
              <Calendar className="mr-1 h-4 w-4" />
              Book Service
            </Button>
          )}
        </div>

        {/* Program Information Link */}
        {programInfo && onViewProgramInfo && (
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={handleViewProgramInfo}
            className="w-full"
          >
            <Info className="mr-2 h-4 w-4" />
            View Program Information
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export type { ProgramServiceTagProps }