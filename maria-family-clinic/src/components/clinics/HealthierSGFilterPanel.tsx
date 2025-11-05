"use client"

import React, { useState } from 'react'
import { X, Heart, Users, Clock, MapPin, Star, Filter, ChevronDown, ChevronUp, Shield, Award, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface HealthierSGFilterPanelProps {
  filters: {
    search: string
    isActive?: boolean
    isHealthierSgPartner?: boolean
    languages?: string[]
    services?: string[]
    location?: {
      latitude: number
      longitude: number
      radiusKm: number
    }
    orderBy: 'name' | 'distance' | 'rating' | 'createdAt'
    orderDirection: 'asc' | 'desc'
    // Healthier SG specific filters
    healthierSGProgramCategories?: string[]
    healthierSGServiceCategories?: string[]
    healthierSGParticipationType?: string[]
    healthierSGClinicStatus?: string[]
    healthierSGCapacityLevel?: 'any' | 'high' | 'medium' | 'low'
    healthierSGWaitTime?: 'any' | '<30min' | '30-60min' | '>1hr'
    healthierSGHasVaccination?: boolean
    healthierSGHasHealthScreening?: boolean
    healthierSGHasChronicCare?: boolean
  }
  onChange: (filters: any) => void
  onClose: () => void
}

// Healthier SG Program Categories (from schema)
const healthierSGProgramCategories = [
  'PREVENTIVE_CARE',
  'CHRONIC_DISEASE_MANAGEMENT', 
  'VACCINATION',
  'HEALTH_SCREENING',
  'LIFESTYLE_COUNSELING',
  'MATERNAL_CHILD_HEALTH',
  'MENTAL_HEALTH',
  'ELDERLY_CARE'
]

// Healthier SG Service Categories (from schema)
const healthierSGServiceCategories = [
  'PRIMARY_CARE',
  'SPECIALIST_CONSULTATION', 
  'DIAGNOSTIC_SERVICES',
  'THERAPEUTIC_SERVICES',
  'PREVENTIVE_SERVICES',
  'REHABILITATION_SERVICES',
  'EMERGENCY_CARE',
  'PHARMACY_SERVICES'
]

// Participation Types (from schema enum)
const participationTypes = [
  { value: 'FULL_PARTICIPANT', label: 'Full Participant', description: 'Complete program participation' },
  { value: 'LIMITED_PARTICIPANT', label: 'Limited Participant', description: 'Partial program services' },
  { value: 'PENDING', label: 'Pending', description: 'Application under review' },
  { value: 'INACTIVE', label: 'Inactive', description: 'Currently not participating' },
  { value: 'SUSPENDED', label: 'Suspended', description: 'Temporarily suspended' }
]

// Clinic Status Options
const clinicStatusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-500' },
  { value: 'INACTIVE', label: 'Inactive', color: 'bg-gray-500' },
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification', color: 'bg-yellow-500' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'bg-red-500' }
]

export function HealthierSGFilterPanel({ filters, onChange, onClose }: HealthierSGFilterPanelProps) {
  const [tempFilters, setTempFilters] = useState(filters)
  const [expandedSections, setExpandedSections] = useState({
    participation: true,
    programs: true,
    services: true,
    capacity: true,
    availability: true,
    specializations: true,
    location: false,
    sort: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleProgramCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...(tempFilters.healthierSGProgramCategories || []), category]
      : (tempFilters.healthierSGProgramCategories || []).filter(c => c !== category)
    
    const updated = { ...tempFilters, healthierSGProgramCategories: newCategories }
    setTempFilters(updated)
    onChange({ healthierSGProgramCategories: newCategories })
  }

  const handleServiceCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...(tempFilters.healthierSGServiceCategories || []), category]
      : (tempFilters.healthierSGServiceCategories || []).filter(c => c !== category)
    
    const updated = { ...tempFilters, healthierSGServiceCategories: newCategories }
    setTempFilters(updated)
    onChange({ healthierSGServiceCategories: newCategories })
  }

  const handleParticipationTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...(tempFilters.healthierSGParticipationType || []), type]
      : (tempFilters.healthierSGParticipationType || []).filter(t => t !== type)
    
    const updated = { ...tempFilters, healthierSGParticipationType: newTypes }
    setTempFilters(updated)
    onChange({ healthierSGParticipationType: newTypes })
  }

  const handleClinicStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...(tempFilters.healthierSGClinicStatus || []), status]
      : (tempFilters.healthierSGClinicStatus || []).filter(s => s !== status)
    
    const updated = { ...tempFilters, healthierSGClinicStatus: newStatuses }
    setTempFilters(updated)
    onChange({ healthierSGClinicStatus: newStatuses })
  }

  const handleCapacityLevelChange = (level: string) => {
    const updated = { ...tempFilters, healthierSGCapacityLevel: level as any }
    setTempFilters(updated)
    onChange({ healthierSGCapacityLevel: level })
  }

  const handleWaitTimeChange = (time: string) => {
    const updated = { ...tempFilters, healthierSGWaitTime: time as any }
    setTempFilters(updated)
    onChange({ healthierSGWaitTime: time })
  }

  const handleSpecializationToggle = (specialization: string, currentValue: boolean | undefined) => {
    const updated = { ...tempFilters, [specialization]: !currentValue }
    setTempFilters(updated)
    onChange({ [specialization]: !currentValue })
  }

  const clearAllFilters = () => {
    const cleared = {
      search: '',
      orderBy: 'name' as const,
      orderDirection: 'asc' as const,
      healthierSGCapacityLevel: 'any' as const,
      healthierSGWaitTime: 'any' as const
    }
    setTempFilters(cleared)
    onChange(cleared)
  }

  const hasActiveFilters = () => {
    return !!(
      tempFilters.healthierSGProgramCategories?.length ||
      tempFilters.healthierSGServiceCategories?.length ||
      tempFilters.healthierSGParticipationType?.length ||
      tempFilters.healthierSGClinicStatus?.length ||
      tempFilters.healthierSGCapacityLevel !== 'any' ||
      tempFilters.healthierSGWaitTime !== 'any' ||
      tempFilters.healthierSGHasVaccination ||
      tempFilters.healthierSGHasHealthScreening ||
      tempFilters.healthierSGHasChronicCare
    )
  }

  const activeFilterCount = () => {
    let count = 0
    if (tempFilters.healthierSGProgramCategories?.length) count++
    if (tempFilters.healthierSGServiceCategories?.length) count++
    if (tempFilters.healthierSGParticipationType?.length) count++
    if (tempFilters.healthierSGClinicStatus?.length) count++
    if (tempFilters.healthierSGCapacityLevel !== 'any') count++
    if (tempFilters.healthierSGWaitTime !== 'any') count++
    if (tempFilters.healthierSGHasVaccination) count++
    if (tempFilters.healthierSGHasHealthScreening) count++
    if (tempFilters.healthierSGHasChronicCare) count++
    return count
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'PREVENTIVE_CARE': <Shield className="h-4 w-4" />,
      'CHRONIC_DISEASE_MANAGEMENT': <Heart className="h-4 w-4" />,
      'VACCINATION': <Activity className="h-4 w-4" />,
      'HEALTH_SCREENING': <Star className="h-4 w-4" />,
      'LIFESTYLE_COUNSELING': <Users className="h-4 w-4" />,
      'MATERNAL_CHILD_HEALTH': <Heart className="h-4 w-4" />,
      'MENTAL_HEALTH': <Heart className="h-4 w-4" />,
      'ELDERLY_CARE': <Users className="h-4 w-4" />
    }
    return iconMap[category] || <Shield className="h-4 w-4" />
  }

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <Card className="border-2 border-green-200 bg-green-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Heart className="h-5 w-5" />
            Healthier SG Filters
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                {activeFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Participation Status Filter */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('participation')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-green-600" />
              Participation Status
            </div>
            {expandedSections.participation ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.participation && (
            <div className="space-y-2 pl-2 max-h-48 overflow-y-auto">
              {participationTypes.map((type) => (
                <div key={type.value} className="flex items-start space-x-2">
                  <Checkbox
                    id={`participation-${type.value}`}
                    checked={tempFilters.healthierSGParticipationType?.includes(type.value) || false}
                    onCheckedChange={(checked) => 
                      handleParticipationTypeChange(type.value, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`participation-${type.value}`}
                      className="text-sm cursor-pointer font-medium"
                    >
                      {type.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-green-200" />

        {/* Program Categories Filter */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('programs')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Program Categories
            </div>
            {expandedSections.programs ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.programs && (
            <div className="space-y-2 pl-2 max-h-48 overflow-y-auto">
              {healthierSGProgramCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`program-${category}`}
                    checked={tempFilters.healthierSGProgramCategories?.includes(category) || false}
                    onCheckedChange={(checked) => 
                      handleProgramCategoryChange(category, checked as boolean)
                    }
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {getCategoryIcon(category)}
                    <Label
                      htmlFor={`program-${category}`}
                      className="text-sm cursor-pointer"
                    >
                      {getCategoryLabel(category)}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-green-200" />

        {/* Service Categories Filter */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('services')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Service Categories
            </div>
            {expandedSections.services ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.services && (
            <div className="space-y-2 pl-2 max-h-48 overflow-y-auto">
              {healthierSGServiceCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${category}`}
                    checked={tempFilters.healthierSGServiceCategories?.includes(category) || false}
                    onCheckedChange={(checked) => 
                      handleServiceCategoryChange(category, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`service-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {getCategoryLabel(category)}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-green-200" />

        {/* Clinic Status Filter */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('capacity')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Clinic Status & Capacity
            </div>
            {expandedSections.capacity ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.capacity && (
            <div className="space-y-4 pl-2">
              {/* Clinic Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Clinic Status</Label>
                <div className="space-y-2">
                  {clinicStatusOptions.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={tempFilters.healthierSGClinicStatus?.includes(status.value) || false}
                        onCheckedChange={(checked) => 
                          handleClinicStatusChange(status.value, checked as boolean)
                        }
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        <Label
                          htmlFor={`status-${status.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {status.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capacity Level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Capacity Level</Label>
                <RadioGroup
                  value={tempFilters.healthierSGCapacityLevel || 'any'}
                  onValueChange={handleCapacityLevelChange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="capacity-any" />
                    <Label htmlFor="capacity-any" className="text-sm">Any capacity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="capacity-high" />
                    <Label htmlFor="capacity-high" className="text-sm">High availability</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="capacity-medium" />
                    <Label htmlFor="capacity-medium" className="text-sm">Medium availability</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="capacity-low" />
                    <Label htmlFor="capacity-low" className="text-sm">Low availability</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Wait Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Expected Wait Time</Label>
                <RadioGroup
                  value={tempFilters.healthierSGWaitTime || 'any'}
                  onValueChange={handleWaitTimeChange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="wait-any" />
                    <Label htmlFor="wait-any" className="text-sm">Any wait time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="<30min" id="wait-fast" />
                    <Label htmlFor="wait-fast" className="text-sm">Less than 30 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30-60min" id="wait-medium" />
                    <Label htmlFor="wait-medium" className="text-sm">30-60 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value=">1hr" id="wait-long" />
                    <Label htmlFor="wait-long" className="text-sm">More than 1 hour</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-green-200" />

        {/* Service Specializations */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('specializations')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              Service Specializations
            </div>
            {expandedSections.specializations ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.specializations && (
            <div className="space-y-3 pl-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vaccination"
                  checked={tempFilters.healthierSGHasVaccination || false}
                  onCheckedChange={() => handleSpecializationToggle('healthierSGHasVaccination', tempFilters.healthierSGHasVaccination)}
                />
                <Label htmlFor="vaccination" className="text-sm cursor-pointer">
                  Vaccination Services
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="health-screening"
                  checked={tempFilters.healthierSGHasHealthScreening || false}
                  onCheckedChange={() => handleSpecializationToggle('healthierSGHasHealthScreening', tempFilters.healthierSGHasHealthScreening)}
                />
                <Label htmlFor="health-screening" className="text-sm cursor-pointer">
                  Health Screening
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="chronic-care"
                  checked={tempFilters.healthierSGHasChronicCare || false}
                  onCheckedChange={() => handleSpecializationToggle('healthierSGHasChronicCare', tempFilters.healthierSGHasChronicCare)}
                />
                <Label htmlFor="chronic-care" className="text-sm cursor-pointer">
                  Chronic Disease Management
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Location Filter (Collapsed by default) */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('location')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Location & Distance
            </div>
            {expandedSections.location ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.location && (
            <div className="space-y-4 pl-2">
              {/* Current Location */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Using your current location</span>
                {tempFilters.location && (
                  <Badge variant="outline" className="ml-auto">
                    {tempFilters.location.radiusKm}km radius
                  </Badge>
                )}
              </div>

              {/* Distance Radius */}
              {tempFilters.location && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Search radius: {tempFilters.location.radiusKm}km
                  </Label>
                  <Slider
                    value={[tempFilters.location.radiusKm]}
                    onValueChange={(value) => {
                      if (tempFilters.location && value[0] !== undefined) {
                        const updated = {
                          ...tempFilters,
                          location: { ...tempFilters.location, radiusKm: value[0] }
                        }
                        setTempFilters(updated)
                        onChange({ location: updated.location })
                      }
                    }}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1km</span>
                    <span>50km</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sort Options (Collapsed by default) */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('sort')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-green-600" />
              Sort By
            </div>
            {expandedSections.sort ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.sort && (
            <div className="space-y-3 pl-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort by</Label>
                <Select
                  value={tempFilters.orderBy}
                  onValueChange={(value: any) => 
                    onChange({ orderBy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="createdAt">Recently Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Order</Label>
                <Select
                  value={tempFilters.orderDirection}
                  onValueChange={(value: any) => 
                    onChange({ orderDirection: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}