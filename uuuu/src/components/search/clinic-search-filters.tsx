"use client"

import React, { useState } from 'react'
import { X, MapPin, Star, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface ClinicSearchFiltersProps {
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
  }
  onChange: (filters: any) => void
  onClose: () => void
}

// Mock data - in real app, this would come from API
const availableLanguages = [
  'English', 'Mandarin', 'Malay', 'Tamil', 'Cantonese', 'Hokkien', 'Teochew'
]

const availableServices = [
  'General Consultation', 'Dental Care', 'Eye Care', 'Dermatology', 'Pediatrics',
  'Cardiology', 'Orthopedics', 'Psychiatry', 'Physiotherapy', 'X-Ray',
  'Blood Test', 'Vaccination', 'Health Screening', 'Preventive Care'
]

export function ClinicSearchFilters({ filters, onChange, onClose }: ClinicSearchFiltersProps) {
  const [tempFilters, setTempFilters] = useState(filters)
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    services: true,
    languages: true,
    verification: true,
    sort: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleLanguageChange = (language: string, checked: boolean) => {
    const newLanguages = checked
      ? [...(tempFilters.languages || []), language]
      : (tempFilters.languages || []).filter(l => l !== language)
    
    const updated = { ...tempFilters, languages: newLanguages }
    setTempFilters(updated)
    onChange({ languages: newLanguages })
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    const newServices = checked
      ? [...(tempFilters.services || []), service]
      : (tempFilters.services || []).filter(s => s !== service)
    
    const updated = { ...tempFilters, services: newServices }
    setTempFilters(updated)
    onChange({ services: newServices })
  }

  const handleRadiusChange = (value: number[]) => {
    if (tempFilters.location && value[0] !== undefined) {
      const updated = {
        ...tempFilters,
        location: { ...tempFilters.location, radiusKm: value[0] }
      }
      setTempFilters(updated)
      onChange({ location: updated.location })
    }
  }

  const clearAllFilters = () => {
    const cleared = {
      search: '',
      orderBy: 'name' as const,
      orderDirection: 'asc' as const
    }
    setTempFilters(cleared)
    onChange(cleared)
  }

  const hasActiveFilters = () => {
    return !!(tempFilters.isActive !== undefined || 
             tempFilters.isHealthierSgPartner || 
             tempFilters.languages?.length || 
             tempFilters.services?.length ||
             tempFilters.location?.radiusKm)
  }

  const activeFilterCount = () => {
    let count = 0
    if (tempFilters.isActive !== undefined) count++
    if (tempFilters.isHealthierSgPartner) count++
    if (tempFilters.languages?.length) count++
    if (tempFilters.services?.length) count++
    if (tempFilters.location?.radiusKm && tempFilters.location.radiusKm !== 10) count++
    return count
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
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
        {/* Location Filter */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('location')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            Location & Distance
            {expandedSections.location ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.location && (
            <div className="space-y-4 pl-2">
              {/* Current Location */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
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
                    onValueChange={handleRadiusChange}
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

        <Separator />

        {/* Services Filter */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('services')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            Services
            {expandedSections.services ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.services && (
            <div className="space-y-2 pl-2 max-h-48 overflow-y-auto">
              {availableServices.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={tempFilters.services?.includes(service) || false}
                    onCheckedChange={(checked) => 
                      handleServiceChange(service, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`service-${service}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Languages Filter */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('languages')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            Languages Spoken
            {expandedSections.languages ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.languages && (
            <div className="space-y-2 pl-2">
              {availableLanguages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`language-${language}`}
                    checked={tempFilters.languages?.includes(language) || false}
                    onCheckedChange={(checked) => 
                      handleLanguageChange(language, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`language-${language}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {language}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Verification Filter */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('verification')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            Verification Status
            {expandedSections.verification ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          
          {expandedSections.verification && (
            <div className="space-y-3 pl-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active-clinics"
                  checked={tempFilters.isActive ?? true}
                  onCheckedChange={(checked) => 
                    onChange({ isActive: checked as boolean })
                  }
                />
                <Label htmlFor="active-clinics" className="text-sm cursor-pointer">
                  Active clinics only
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="moh-verified"
                  checked={tempFilters.isHealthierSgPartner || false}
                  onCheckedChange={(checked) => 
                    onChange({ isHealthierSgPartner: checked as boolean })
                  }
                />
                <Label htmlFor="moh-verified" className="text-sm cursor-pointer">
                  MOH Verified / Healthier SG Partners
                </Label>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Sort Options */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('sort')}
            className="w-full justify-between p-0 h-auto font-semibold"
          >
            Sort By
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