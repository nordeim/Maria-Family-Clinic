import * as React from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Star, 
  Clock, 
  Shield, 
  Building, 
  Stethoscope,
  Globe,
  Accessibility,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { FilterCategory as FilterCategoryType } from '@/types/search'

interface FilterCategoryProps {
  category: FilterCategoryType
  selectedValues: string[]
  onFilterChange: (values: string[]) => void
  searchable?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

const getFilterIcon = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    stethoscope: Stethoscope,
    globe: Globe,
    clock: Clock,
    building: Building,
    accessibility: Accessibility,
    star: Star,
    shield: Shield,
  }
  
  return iconMap[iconName] || null
}

export function FilterCategory({
  category,
  selectedValues,
  onFilterChange,
  searchable = false,
  collapsible = false,
  defaultOpen = false,
  className,
}: FilterCategoryProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const filteredOptions = searchQuery
    ? category.options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : category.options

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter(v => v !== optionValue)
    onFilterChange(newValues)
  }

  const handleRadioChange = (optionValue: string) => {
    onFilterChange([optionValue])
  }

  const Icon = getFilterIcon(category.icon || '')

  const renderFilterContent = () => {
    switch (category.type) {
      case 'checkbox':
        return (
          <div className="space-y-3">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(option.value, checked as boolean)
                    }
                    disabled={option.disabled}
                  />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                    {option.count !== undefined && (
                      <span className="text-muted-foreground ml-1">({option.count})</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-3">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            )}
            
            <RadioGroup
              value={selectedValues[0] || ''}
              onValueChange={handleRadioChange}
            >
              {filteredOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                    {option.count !== undefined && (
                      <span className="text-muted-foreground ml-1">({option.count})</span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 'select':
        return (
          <Select
            value={selectedValues[0] || ''}
            onValueChange={(value) => onFilterChange([value])}
          >
            <SelectTrigger>
              <SelectValue placeholder={category.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {category.options.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                  {option.count !== undefined && (
                    <span className="text-muted-foreground ml-2">({option.count})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'range':
        return (
          <div className="space-y-4">
            <Slider
              value={[parseInt(selectedValues[0] || '0')]}
              onValueChange={(values) => onFilterChange([(values[0] || 0).toString()])}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0</span>
              <span className="font-medium">{selectedValues[0] || '0'}</span>
              <span>100</span>
            </div>
          </div>
        )

      case 'autocomplete':
        return (
          <div className="space-y-3">
            <div className="relative">
              <Input
                placeholder={category.placeholder || "Start typing..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <div className="border rounded-md bg-background">
                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                    onClick={() => onFilterChange([option.value])}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return <div>Unsupported filter type</div>
    }
  }

  const categoryContent = (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        <h4 className="text-sm font-medium">{category.title}</h4>
        {selectedValues.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {selectedValues.length}
          </Badge>
        )}
        {searchable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {category.description && (
        <p className="text-xs text-muted-foreground">{category.description}</p>
      )}
      
      {renderFilterContent()}
    </div>
  )

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            {categoryContent}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          {categoryContent}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return categoryContent
}