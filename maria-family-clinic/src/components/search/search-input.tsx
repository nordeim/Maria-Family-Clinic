import * as React from 'react'
import { X, Search, MapPin, Filter, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useDebounce } from '@/hooks/use-debounce'
import { SearchFilters as SearchFiltersType } from '@/types/search'

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (query: string) => void
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
  placeholder?: string
  showLocation?: boolean
  onLocationRequest?: () => void
}

export function SearchInput({
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  placeholder = "Search clinics, services, or specialties...",
  showLocation = true,
  onLocationRequest,
  className,
  ...props
}: SearchInputProps) {
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const debouncedQuery = useDebounce(query, 300)

  React.useEffect(() => {
    if (debouncedQuery && onSearch) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && onSuggestionSelect) {
          onSuggestionSelect(suggestions[selectedIndex])
          setIsOpen(false)
          setSelectedIndex(-1)
        } else if (onSearch) {
          onSearch(query)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setIsOpen(false)
    setSelectedIndex(-1)
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }
    if (onSearch) {
      onSearch(suggestion)
    }
  }

  const showSuggestions = isOpen && suggestions.length > 0

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          {...props}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-12"
        />
        {showLocation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLocationRequest}
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground",
                index === selectedIndex && "bg-accent text-accent-foreground"
              )}
            >
              <Search className="inline h-3 w-3 mr-2" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}