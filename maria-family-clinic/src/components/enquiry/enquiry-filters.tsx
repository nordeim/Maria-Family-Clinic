'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  X, 
  Search, 
  Calendar as CalendarIcon,
  Tag,
  User,
  Building,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { EnquiryFilters, EnquiryType, EnquiryStatus, EnquiryPriority, EnquirySource } from './types'
import { format } from 'date-fns'

interface EnquiryFiltersProps {
  filters: EnquiryFilters
  onFiltersChange: (filters: EnquiryFilters) => void
  clinicId?: string
  availableStaff?: Array<{ id: string; name: string; role: string }>
  availableTags?: string[]
}

export function EnquiryFiltersComponent({ 
  filters, 
  onFiltersChange, 
  clinicId,
  availableStaff = [],
  availableTags = []
}: EnquiryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<EnquiryFilters>(filters)

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof EnquiryFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | undefined) => {
    const newDateRange = {
      ...localFilters.dateRange,
      [field]: date
    }
    handleFilterChange('dateRange', newDateRange)
  }

  const handleStatusChange = (status: EnquiryStatus, checked: boolean) => {
    const currentStatuses = localFilters.status || []
    const newStatuses = checked 
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    handleFilterChange('status', newStatuses.length > 0 ? newStatuses : undefined)
  }

  const handleTypeChange = (type: EnquiryType, checked: boolean) => {
    const currentTypes = localFilters.type || []
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type)
    handleFilterChange('type', newTypes.length > 0 ? newTypes : undefined)
  }

  const handlePriorityChange = (priority: EnquiryPriority, checked: boolean) => {
    const currentPriorities = localFilters.priority || []
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority)
    handleFilterChange('priority', newPriorities.length > 0 ? newPriorities : undefined)
  }

  const handleSourceChange = (source: EnquirySource, checked: boolean) => {
    const currentSources = localFilters.source || []
    const newSources = checked
      ? [...currentSources, source]
      : currentSources.filter(s => s !== source)
    handleFilterChange('source', newSources.length > 0 ? newSources : undefined)
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = localFilters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    handleFilterChange('tags', newTags.length > 0 ? newTags : undefined)
  }

  const clearAllFilters = () => {
    const emptyFilters: EnquiryFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.status?.length) count++
    if (localFilters.type?.length) count++
    if (localFilters.priority?.length) count++
    if (localFilters.clinicId) count++
    if (localFilters.assignedTo) count++
    if (localFilters.source?.length) count++
    if (localFilters.tags?.length) count++
    if (localFilters.dateRange?.start || localFilters.dateRange?.end) count++
    if (localFilters.searchQuery) count++
    if (localFilters.isOverdue) count++
    if (localFilters.requiresFollowUp) count++
    if (localFilters.hasLowSatisfaction) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const enquiryTypes: EnquiryType[] = [
    'GENERAL', 'APPOINTMENT', 'HEALTHIER_SG', 'CLINIC_INFORMATION', 
    'DOCTOR_INFORMATION', 'SERVICE_INFORMATION', 'COMPLAINT', 'FEEDBACK'
  ]

  const enquiryStatuses: EnquiryStatus[] = [
    'NEW', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'
  ]

  const enquiryPriorities: EnquiryPriority[] = [
    'LOW', 'NORMAL', 'HIGH', 'URGENT'
  ]

  const enquirySources: EnquirySource[] = [
    'website', 'phone', 'email', 'walk_in', 'referral', 'social_media', 'app'
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search enquiries..."
                value={localFilters.searchQuery || ''}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value || undefined)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {enquiryStatuses.map((status) => (
                <label key={status} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={localFilters.status?.includes(status) || false}
                    onChange={(e) => handleStatusChange(status, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-1 gap-2">
              {enquiryTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={localFilters.type?.includes(type) || false}
                    onChange={(e) => handleTypeChange(type, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="capitalize">{type.toLowerCase().replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-2 gap-2">
              {enquiryPriorities.map((priority) => (
                <label key={priority} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={localFilters.priority?.includes(priority) || false}
                    onChange={(e) => handlePriorityChange(priority, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="capitalize">{priority.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Source Filter */}
          <div className="space-y-2">
            <Label>Source</Label>
            <div className="grid grid-cols-2 gap-2">
              {enquirySources.map((source) => (
                <label key={source} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={localFilters.source?.includes(source) || false}
                    onChange={(e) => handleSourceChange(source, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="capitalize">{source.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-date" className="text-xs">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange?.start ? 
                        format(localFilters.dateRange.start, 'MMM dd, yyyy') : 
                        'Select date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateRange?.start}
                      onSelect={(date) => handleDateRangeChange('start', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange?.end ? 
                        format(localFilters.dateRange.end, 'MMM dd, yyyy') : 
                        'Select date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateRange?.end}
                      onSelect={(date) => handleDateRangeChange('end', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          {availableStaff.length > 0 && (
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={localFilters.assignedTo || ''}
                onValueChange={(value) => handleFilterChange('assignedTo', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All staff</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {availableStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={localFilters.tags?.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    {localFilters.tags?.includes(tag) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Special Filters */}
          <div className="space-y-2">
            <Label>Special Filters</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={localFilters.isOverdue || false}
                  onChange={(e) => handleFilterChange('isOverdue', e.target.checked || undefined)}
                  className="rounded border-gray-300"
                />
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>Overdue only</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={localFilters.requiresFollowUp || false}
                  onChange={(e) => handleFilterChange('requiresFollowUp', e.target.checked || undefined)}
                  className="rounded border-gray-300"
                />
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Requires follow-up</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={localFilters.hasLowSatisfaction || false}
                  onChange={(e) => handleFilterChange('hasLowSatisfaction', e.target.checked || undefined)}
                  className="rounded border-gray-300"
                />
                <span>Low satisfaction</span>
              </label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}