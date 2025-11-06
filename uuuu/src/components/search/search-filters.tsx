import * as React from 'react'
import { 
  Filter, 
  RotateCcw, 
  Search, 
  MapPin, 
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Collapsible,
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { SearchInput } from './search-input'
import { FilterCategory } from './filter-category'
import { ActiveFilters, FilterChip } from './filter-chip'
import { 
  SearchFilters as SearchFiltersType,
  FilterCategory as FilterCategoryType
} from '@/types/search'
import { FILTER_CATEGORIES } from '@/lib/filters'

interface SearchFiltersProps {
  filters: SearchFiltersType
  filterCategories: FilterCategoryType[]
  isLoading?: boolean
  resultCount?: number
  onFiltersChange: (filters: SearchFiltersType) => void
  onLocationRequest?: () => void
  showSearchHistory?: boolean
  searchHistory?: string[]
  onClearHistory?: () => void
  onFilterReset?: () => void
  className?: string
}

export function SearchFilters({
  filters,
  filterCategories = FILTER_CATEGORIES,
  isLoading = false,
  resultCount = 0,
  onFiltersChange,
  onLocationRequest,
  showSearchHistory = true,
  searchHistory = [],
  onClearHistory,
  onFilterReset,
  className,
}: SearchFiltersProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false)
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({})

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.services && filters.services.length > 0) count += filters.services.length
    if (filters.languages && filters.languages.length > 0) count += filters.languages.length
    if (filters.operatingHours && filters.operatingHours.length > 0) count += filters.operatingHours.length
    if (filters.clinicTypes && filters.clinicTypes.length > 0) count += filters.clinicTypes.length
    if (filters.accessibilityFeatures && filters.accessibilityFeatures.length > 0) count += filters.accessibilityFeatures.length
    if (filters.rating) count++
    if (filters.insurance && filters.insurance.length > 0) count += filters.insurance.length
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Update search query
  const handleSearchQueryChange = (query: string) => {
    onFiltersChange({
      ...filters,
      query: query || undefined,
    })
  }

  // Handle filter changes for each category
  const handleCategoryFilterChange = (categoryId: string, values: string[]) => {
    const categoryFilters = getCategoryFilters(categoryId)
    
    onFiltersChange({
      ...filters,
      ...categoryFilters(values),
    })
  }

  // Get filter setter for each category
  const getCategoryFilters = (categoryId: string) => {
    const filterSetters: Record<string, (values: string[]) => Partial<SearchFiltersType>> = {
      services: (values) => ({ services: values }),
      languages: (values) => ({ languages: values }),
      operatingHours: (values) => ({ operatingHours: values as any }),
      clinicTypes: (values) => ({ clinicTypes: values as any }),
      accessibilityFeatures: (values) => ({ accessibilityFeatures: values as any }),
      rating: (values) => ({ rating: values[0] as any }),
      insurance: (values) => ({ insurance: values as any }),
    }

    return filterSetters[categoryId] || (() => ({}))
  }

  // Get selected values for each category
  const getCategorySelectedValues = (categoryId: string): string[] => {
    const categoryGetters: Record<string, () => string[]> = {
      services: () => filters.services || [],
      languages: () => filters.languages || [],
      operatingHours: () => filters.operatingHours || [],
      clinicTypes: () => filters.clinicTypes || [],
      accessibilityFeatures: () => filters.accessibilityFeatures || [],
      rating: () => filters.rating ? [filters.rating] : [],
      insurance: () => filters.insurance || [],
    }

    return categoryGetters[categoryId]?.() || []
  }

  // Get display labels for active filters
  const getActiveFilterDisplays = () => {
    const displays: Array<{ label: string; value: string; category: string }> = []

    if (filters.query) {
      displays.push({ label: filters.query, value: filters.query, category: 'query' })
    }

    // Map filter values to display labels
    filterCategories.forEach(category => {
      const selectedValues = getCategorySelectedValues(category.id)
      selectedValues.forEach(value => {
        const option = category.options.find(opt => opt.value === value)
        if (option) {
          displays.push({
            label: option.label,
            value: option.value,
            category: category.id
          })
        }
      })
    })

    return displays
  }

  // Remove individual filter
  const handleRemoveFilter = (value: string, category?: string) => {
    if (!category) return
    if (category === 'query') {
      onFiltersChange({ ...filters, query: undefined })
      return
    }

    const categoryFilters = getCategoryFilters(category)
    const currentValues = getCategorySelectedValues(category)
    const newValues = currentValues.filter(v => v !== value)
    
    onFiltersChange({
      ...filters,
      ...categoryFilters(newValues),
    })
  }

  // Clear all filters
  const handleClearAllFilters = () => {
    onFiltersChange({
      query: undefined,
      services: undefined,
      languages: undefined,
      operatingHours: undefined,
      clinicTypes: undefined,
      accessibilityFeatures: undefined,
      rating: undefined,
      insurance: undefined,
      location: undefined,
    })
    if (onFilterReset) {
      onFilterReset()
    }
  }

  // Toggle category expansion
  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const activeFilterDisplays = getActiveFilterDisplays()

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Search</label>
        <SearchInput
          placeholder="Search clinics, services, or locations..."
          onSearch={handleSearchQueryChange}
          onLocationRequest={onLocationRequest}
        />
      </div>

      <Separator />

      {/* Search History */}
      {showSearchHistory && searchHistory.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Recent Searches</label>
            {onClearHistory && (
              <Button variant="ghost" size="sm" onClick={onClearHistory}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSearchQueryChange(query)}
                className="h-7"
              >
                <Search className="h-3 w-3 mr-1" />
                {query}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Categories */}
      {filterCategories.map((category) => (
        <div key={category.id} className="space-y-3">
          <Collapsible
            open={expandedCategories[category.id] !== false}
            onOpenChange={() => handleToggleCategory(category.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto"
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{category.title}</h4>
                  {getCategorySelectedValues(category.id).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getCategorySelectedValues(category.id).length}
                    </Badge>
                  )}
                </div>
                {expandedCategories[category.id] !== false ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <FilterCategory
                category={category}
                selectedValues={getCategorySelectedValues(category.id)}
                onFilterChange={(values) => handleCategoryFilterChange(category.id, values)}
                searchable={category.searchable}
                className="space-y-2"
              />
            </CollapsibleContent>
          </Collapsible>
          <Separator />
        </div>
      ))}

      {/* Clear All Button */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={handleClearAllFilters}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80 sm:w-96">
            <SheetHeader>
              <SheetTitle>Filter Clinics</SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto h-[calc(100vh-8rem)]">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <Card className="hidden lg:block">
        <CardContent className="p-6">
          <FilterContent />
        </CardContent>
      </Card>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Active filters ({activeFilterCount}):
          </span>
          <ActiveFilters
            filters={activeFilterDisplays}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={activeFilterCount > 1 ? handleClearAllFilters : undefined}
          />
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isLoading 
            ? 'Searching...' 
            : resultCount > 0 
              ? `Found ${resultCount} clinic${resultCount === 1 ? '' : 's'}`
              : 'No clinics found'
          }
        </span>
        {filters.location && (
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {filters.location.radiusKm}km radius
          </Badge>
        )}
      </div>
    </div>
  )
}