import * as React from "react"
import { 
  Shield, 
  ShieldCheck, 
  Award, 
  Clock, 
  Heart, 
  Users, 
  Car, 
  Accessibility,
  Stethoscope,
  MapPin,
  Calendar,
  Phone,
  CheckCircle,
  AlertTriangle,
  Info,
  Leaf,
  Brain,
  Eye,
  Bug,
  Plane,
  Star,
  Pill,
  Coffee,
  CreditCard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Trust Badge Component
interface TrustBadgeProps {
  type: 'moh-verified' | 'covid-safe' | 'ae-available' | 'accredited' | 'emergency-ready'
  verified?: boolean
  lastUpdated?: Date
  className?: string
  showLabel?: boolean
}

const TrustBadge = React.forwardRef<HTMLDivElement, TrustBadgeProps>(
  ({ type, verified = true, lastUpdated, className, showLabel = true, ...props }, ref) => {
    const getBadgeConfig = () => {
      switch (type) {
        case 'moh-verified':
          return {
            icon: verified ? ShieldCheck : Shield,
            label: 'MOH Verified',
            variant: 'success' as const,
            description: 'Verified by Ministry of Health Singapore',
            bgColor: verified ? 'bg-green-50' : 'bg-gray-50',
            borderColor: verified ? 'border-green-200' : 'border-gray-200',
            iconColor: verified ? 'text-green-600' : 'text-gray-400'
          }
        case 'covid-safe':
          return {
            icon: Shield,
            label: 'COVID Safe',
            variant: 'success' as const,
            description: 'Enhanced safety protocols implemented',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600'
          }
        case 'ae-available':
          return {
            icon: AlertTriangle,
            label: 'A&E Available',
            variant: 'destructive' as const,
            description: 'Accident & Emergency services available 24/7',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600'
          }
        case 'accredited':
          return {
            icon: Award,
            label: 'Accredited',
            variant: 'secondary' as const,
            description: 'Accredited healthcare facility',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            iconColor: 'text-amber-600'
          }
        case 'emergency-ready':
          return {
            icon: Heart,
            label: 'Emergency Ready',
            variant: 'destructive' as const,
            description: 'Emergency response capabilities',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600'
          }
        default:
          return {
            icon: Info,
            label: 'Verified',
            variant: 'outline' as const,
            description: 'Verified status',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            iconColor: 'text-gray-600'
          }
      }
    }

    const config = getBadgeConfig()
    const Icon = config.icon

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
          config.bgColor,
          config.borderColor,
          className
        )}
        title={config.description}
        {...props}
      >
        <Icon className={cn('h-3.5 w-3.5', config.iconColor)} />
        {showLabel && <span className={cn('text-xs', config.iconColor)}>{config.label}</span>}
        {lastUpdated && (
          <span className="text-xs text-gray-400 ml-1">
            Updated {lastUpdated.toLocaleDateString()}
          </span>
        )}
      </div>
    )
  }
)
TrustBadge.displayName = "TrustBadge"

// Insurance Badge Component
interface InsuranceBadgeProps {
  accepted: boolean
  providers?: string[]
  className?: string
}

const InsuranceBadge = React.forwardRef<HTMLDivElement, InsuranceBadgeProps>(
  ({ accepted, providers = [], className, ...props }, ref) => {
    if (!accepted) {
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium bg-gray-50 border-gray-200 text-gray-600',
            className
          )}
          {...props}
        >
          <Info className="h-3.5 w-3.5" />
          <span>Insurance Info</span>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium bg-green-50 border-green-200 text-green-700',
          className
        )}
        title={`Accepts: ${providers.join(', ')}`}
        {...props}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        <span>Insurance Accepted</span>
        {providers.length > 0 && (
          <span className="text-xs text-green-600">
            ({providers.length} providers)
          </span>
        )}
      </div>
    )
  }
)
InsuranceBadge.displayName = "InsuranceBadge"

// Facilities Badge Component
interface FacilitiesBadgesProps {
  hasParking?: boolean
  isWheelchairAccessible?: boolean
  hasPharmacy?: boolean
  hasRadiology?: boolean
  hasLaboratory?: boolean
  hasCafeteria?: boolean
  hasATM?: boolean
  className?: string
}

const FacilitiesBadges = React.forwardRef<HTMLDivElement, FacilitiesBadgesProps>(
  ({ 
    hasParking, 
    isWheelchairAccessible, 
    hasPharmacy,
    hasRadiology,
    hasLaboratory,
    hasCafeteria,
    hasATM,
    className,
    ...props 
  }, ref) => {
    const facilities = []

    if (isWheelchairAccessible) {
      facilities.push({
        icon: Accessibility,
        label: 'Wheelchair Access',
        variant: 'success' as const,
        color: 'text-green-600 bg-green-50 border-green-200'
      })
    }

    if (hasParking) {
      facilities.push({
        icon: Car,
        label: 'Parking Available',
        variant: 'secondary' as const,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      })
    }

    if (hasPharmacy) {
      facilities.push({
        icon: Pill,
        label: 'On-site Pharmacy',
        variant: 'outline' as const,
        color: 'text-purple-600 bg-purple-50 border-purple-200'
      })
    }

    if (hasRadiology) {
      facilities.push({
        icon: Eye,
        label: 'Radiology Services',
        variant: 'outline' as const,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
      })
    }

    if (hasLaboratory) {
      facilities.push({
        icon: Bug,
        label: 'Laboratory Services',
        variant: 'outline' as const,
        color: 'text-orange-600 bg-orange-50 border-orange-200'
      })
    }

    if (hasCafeteria) {
      facilities.push({
        icon: Coffee,
        label: 'Cafeteria',
        variant: 'outline' as const,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
      })
    }

    if (hasATM) {
      facilities.push({
        icon: CreditCard,
        label: 'ATM Available',
        variant: 'outline' as const,
        color: 'text-teal-600 bg-teal-50 border-teal-200'
      })
    }

    if (facilities.length === 0) return null

    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-1.5', className)}
        {...props}
      >
        {facilities.map((facility, index) => {
          const Icon = facility.icon
          return (
            <Badge
              key={index}
              variant="outline"
              className={cn('text-xs gap-1', facility.color)}
            >
              <Icon className="h-3 w-3" />
              {facility.label}
            </Badge>
          )
        })}
      </div>
    )
  }
)
FacilitiesBadges.displayName = "FacilitiesBadges"

// Community Health Program Badge Component
interface CommunityHealthBadgeProps {
  program: 'healthier-sg' | 'screen-for-life' | 'chas' | 'medisave'
  enrolled: boolean
  className?: string
}

const CommunityHealthBadge = React.forwardRef<HTMLDivElement, CommunityHealthBadgeProps>(
  ({ program, enrolled, className, ...props }, ref) => {
    const getProgramConfig = () => {
      switch (program) {
        case 'healthier-sg':
          return {
            icon: Leaf,
            label: 'Healthier SG',
            description: 'Healthier SG program participant',
            color: enrolled ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-500 bg-gray-50 border-gray-200'
          }
        case 'screen-for-life':
          return {
            icon: ShieldCheck,
            label: 'Screen for Life',
            description: 'Screen for Life program participant',
            color: enrolled ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-gray-500 bg-gray-50 border-gray-200'
          }
        case 'chas':
          return {
            icon: Heart,
            label: 'CHAS',
            description: 'Community Health Assist Scheme',
            color: enrolled ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-gray-500 bg-gray-50 border-gray-200'
          }
        case 'medisave':
          return {
            icon: Shield,
            label: 'Medisave',
            description: 'Medisave accepted',
            color: enrolled ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-gray-500 bg-gray-50 border-gray-200'
          }
        default:
          return {
            icon: Info,
            label: 'Program',
            description: 'Health program',
            color: 'text-gray-500 bg-gray-50 border-gray-200'
          }
      }
    }

    const config = getProgramConfig()
    const Icon = config.icon

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
          config.color,
          className
        )}
        title={config.description}
        {...props}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{config.label}</span>
      </div>
    )
  }
)
CommunityHealthBadge.displayName = "CommunityHealthBadge"

// Wait Time Indicator Component
interface WaitTimeIndicatorProps {
  waitTime: 'short' | 'medium' | 'long' | 'very-long'
  estimatedMinutes?: number
  isLive?: boolean
  className?: string
}

const WaitTimeIndicator = React.forwardRef<HTMLDivElement, WaitTimeIndicatorProps>(
  ({ waitTime, estimatedMinutes, isLive = true, className, ...props }, ref) => {
    const getWaitTimeConfig = () => {
      switch (waitTime) {
        case 'short':
          return {
            color: 'text-green-700 bg-green-50 border-green-200',
            icon: Clock,
            label: 'Short wait',
            description: estimatedMinutes ? `${estimatedMinutes} min` : '~15 min'
          }
        case 'medium':
          return {
            color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
            icon: Clock,
            label: 'Moderate wait',
            description: estimatedMinutes ? `${estimatedMinutes} min` : '~30 min'
          }
        case 'long':
          return {
            color: 'text-orange-700 bg-orange-50 border-orange-200',
            icon: Clock,
            label: 'Long wait',
            description: estimatedMinutes ? `${estimatedMinutes} min` : '~45 min'
          }
        case 'very-long':
          return {
            color: 'text-red-700 bg-red-50 border-red-200',
            icon: Clock,
            label: 'Very long wait',
            description: estimatedMinutes ? `${estimatedMinutes} min` : '60+ min'
          }
        default:
          return {
            color: 'text-gray-500 bg-gray-50 border-gray-200',
            icon: Clock,
            label: 'Wait time',
            description: 'Unknown'
          }
      }
    }

    const config = getWaitTimeConfig()
    const Icon = config.icon

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
          config.color,
          className
        )}
        title={`${config.label}${isLive ? ' (Live)' : ''}`}
        {...props}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{config.description}</span>
        {isLive && (
          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
        )}
      </div>
    )
  }
)
WaitTimeIndicator.displayName = "WaitTimeIndicator"

// Verification Status Component
interface VerificationStatusProps {
  status: 'verified' | 'pending' | 'expired' | 'unverified'
  verifiedDate?: Date
  expiryDate?: Date
  licenseNumber?: string
  className?: string
}

const VerificationStatus = React.forwardRef<HTMLDivElement, VerificationStatusProps>(
  ({ status, verifiedDate, expiryDate, licenseNumber, className, ...props }, ref) => {
    const getStatusConfig = () => {
      switch (status) {
        case 'verified':
          return {
            color: 'text-green-700 bg-green-50 border-green-200',
            icon: CheckCircle,
            label: 'Verified',
            description: verifiedDate ? `Verified on ${verifiedDate.toLocaleDateString()}` : 'Verified'
          }
        case 'pending':
          return {
            color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
            icon: Clock,
            label: 'Pending Verification',
            description: 'Under review'
          }
        case 'expired':
          return {
            color: 'text-red-700 bg-red-50 border-red-200',
            icon: AlertTriangle,
            label: 'Verification Expired',
            description: expiryDate ? `Expired on ${expiryDate.toLocaleDateString()}` : 'Verification expired'
          }
        case 'unverified':
          return {
            color: 'text-gray-500 bg-gray-50 border-gray-200',
            icon: Info,
            label: 'Not Verified',
            description: 'No verification status'
          }
        default:
          return {
            color: 'text-gray-500 bg-gray-50 border-gray-200',
            icon: Info,
            label: 'Unknown',
            description: 'Verification status unknown'
          }
      }
    }

    const config = getStatusConfig()
    const Icon = config.icon

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
          config.color,
          className
        )}
        title={config.description}
        {...props}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{config.label}</span>
        {licenseNumber && (
          <span className="text-xs opacity-75">
            #{licenseNumber}
          </span>
        )}
      </div>
    )
  }
)
VerificationStatus.displayName = "VerificationStatus"

// Emergency Clinic Indicator Component
interface EmergencyIndicatorProps {
  isEmergencyCapable: boolean
  emergencyTypes?: ('24h' | 'a&e' | 'urgent-care' | 'ambulance')[]
  phoneNumber?: string
  className?: string
}

const EmergencyIndicator = React.forwardRef<HTMLDivElement, EmergencyIndicatorProps>(
  ({ isEmergencyCapable, emergencyTypes = [], phoneNumber, className, ...props }, ref) => {
    if (!isEmergencyCapable) return null

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium bg-red-50 border-red-200 text-red-700',
          className
        )}
        title="Emergency services available"
        {...props}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Emergency</span>
        {emergencyTypes.includes('24h') && (
          <span className="text-xs">24h</span>
        )}
        {emergencyTypes.includes('a&e') && (
          <span className="text-xs">A&E</span>
        )}
      </div>
    )
  }
)
EmergencyIndicator.displayName = "EmergencyIndicator"

// Last Updated Component
interface LastUpdatedProps {
  timestamp: Date
  label?: string
  showRelative?: boolean
  className?: string
}

const LastUpdated = React.forwardRef<HTMLDivElement, LastUpdatedProps>(
  ({ timestamp, label = "Updated", showRelative = true, className, ...props }, ref) => {
    const getRelativeTime = (date: Date) => {
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h ago`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`
      
      return date.toLocaleDateString()
    }

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}
        title={`${label}: ${timestamp.toLocaleString()}`}
        {...props}
      >
        <Clock className="h-3 w-3" />
        <span>{showRelative ? getRelativeTime(timestamp) : timestamp.toLocaleDateString()}</span>
      </div>
    )
  }
)
LastUpdated.displayName = "LastUpdated"

export {
  TrustBadge,
  InsuranceBadge,
  FacilitiesBadges,
  CommunityHealthBadge,
  WaitTimeIndicator,
  VerificationStatus,
  EmergencyIndicator,
  LastUpdated
}

export type {
  TrustBadgeProps,
  InsuranceBadgeProps,
  FacilitiesBadgesProps,
  CommunityHealthBadgeProps,
  WaitTimeIndicatorProps,
  VerificationStatusProps,
  EmergencyIndicatorProps,
  LastUpdatedProps
}