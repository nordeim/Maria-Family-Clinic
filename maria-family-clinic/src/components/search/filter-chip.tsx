import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FilterChipProps {
  label: string
  value: string
  category?: string
  onRemove?: (value: string, category?: string) => void
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  showIcon?: boolean
  icon?: React.ReactNode
  className?: string
}

export function FilterChip({
  label,
  value,
  category,
  onRemove,
  variant = 'default',
  size = 'default',
  showIcon = true,
  icon,
  className,
}: FilterChipProps) {
  const handleRemove = () => {
    if (onRemove) {
      onRemove(value, category)
    }
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        "flex items-center gap-1 pr-1",
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'default' && 'text-sm px-2.5 py-1',
        className
      )}
    >
      {showIcon && (
        icon || (
          <div className="h-3 w-3 bg-current opacity-70 rounded-sm" />
        )
      )}
      <span className="truncate max-w-[150px]">{label}</span>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="h-auto p-0 hover:bg-transparent"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove {label} filter</span>
        </Button>
      )}
    </Badge>
  )
}

interface ActiveFiltersProps {
  filters: Array<{
    label: string
    value: string
    category: string
  }>
  onRemoveFilter: (value: string, category?: string) => void
  onClearAll?: () => void
  className?: string
}

export function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: ActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Active filters:
      </span>
      {filters.map((filter, index) => (
        <FilterChip
          key={`${filter.category}-${filter.value}-${index}`}
          label={filter.label}
          value={filter.value}
          category={filter.category}
          onRemove={onRemoveFilter}
          variant="secondary"
          size="sm"
        />
      ))}
      {onClearAll && filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  )
}

interface FilterChipGroupProps {
  title: string
  filters: Array<{
    id: string
    label: string
    value: string
    count?: number
    disabled?: boolean
  }>
  selectedValues: string[]
  onFilterChange: (values: string[]) => void
  maxVisible?: number
  allowSearch?: boolean
  className?: string
}

export function FilterChipGroup({
  title,
  filters,
  selectedValues,
  onFilterChange,
  maxVisible = 5,
  allowSearch = false,
  className,
}: FilterChipGroupProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  
  const filteredFilters = searchQuery
    ? filters.filter(filter => 
        filter.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filters

  const visibleFilters = filteredFilters.slice(0, maxVisible)
  const hasMoreFilters = filteredFilters.length > maxVisible
  const [showAll, setShowAll] = React.useState(false)

  const displayFilters = showAll ? filteredFilters : visibleFilters

  const handleFilterToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    onFilterChange(newValues)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium">{title}</h4>
      
      {allowSearch && (
        <Input
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-sm"
        />
      )}

      <div className="flex flex-wrap gap-1">
        {displayFilters.map((filter) => {
          const isSelected = selectedValues.includes(filter.value)
          
          return (
            <Button
              key={filter.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterToggle(filter.value)}
              disabled={filter.disabled}
              className={cn(
                "transition-all",
                isSelected && "ring-2 ring-offset-2",
                filter.count !== undefined && "gap-1"
              )}
            >
              <span>{filter.label}</span>
              {filter.count !== undefined && (
                <span className="text-xs opacity-70">({filter.count})</span>
              )}
            </Button>
          )
        })}
        
        {hasMoreFilters && !showAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
          >
            +{filteredFilters.length - maxVisible} more
          </Button>
        )}
        
        {showAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(false)}
          >
            Show less
          </Button>
        )}
      </div>
    </div>
  )
}