'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Mic, MicOff, MapPin, Clock, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SearchSuggestion } from '@/types/search'
import { medicalTermRecognizer } from '@/lib/medical-terms'
import { useDebounce } from '@/hooks/use-debounce'
import { useVoiceSearch } from '@/hooks/use-voice-search'
import { useSearchSuggestions } from '@/hooks/use-search'

interface ServiceSearchInputProps {
  onSearch: (query: string, filters?: any) => void
  onVoiceSearch: (query: string) => void
  onLocationRequest: () => void
  placeholder?: string
  className?: string
  showVoiceSearch?: boolean
  showLocationSearch?: boolean
  showFilters?: boolean
  suggestions?: SearchSuggestion[]
  recentSearches?: string[]
  onClearRecent?: () => void
}

export function ServiceSearchInput({
  onSearch,
  onVoiceSearch,
  onLocationRequest,
  placeholder = "Search medical services, specialties, or symptoms...",
  className,
  showVoiceSearch = true,
  showLocationSearch = true,
  showFilters = true,
  suggestions = [],
  recentSearches = [],
  onClearRecent,
}: ServiceSearchInputProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced query for medical term recognition
  const debouncedQuery = useDebounce(query, 200)
  const { isListening, startListening, stopListening } = useVoiceSearch()

  // Medical term recognition
  const [recognizedTerms, setRecognizedTerms] = useState<string[]>([])
  const [suggestedFilters, setSuggestedFilters] = useState<any>({})

  // Effect to recognize medical terms
  useEffect(() => {
    if (debouncedQuery.trim()) {
      const recognition = medicalTermRecognizer.recognizeTerms(debouncedQuery)
      setRecognizedTerms(recognition.recognizedTerms)
      
      if (recognition.recognizedTerms.length > 0) {
        const filters = medicalTermRecognizer.suggestFilters(recognition.recognizedTerms)
        setSuggestedFilters(filters)
      }
    } else {
      setRecognizedTerms([])
      setSuggestedFilters({})
    }
  }, [debouncedQuery])

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), suggestedFilters)
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }, [query, suggestedFilters, onSearch])

  // Handle voice search
  const handleVoiceSearch = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Handle voice result
  const handleVoiceResult = useCallback((transcript: string) => {
    setQuery(transcript)
    onVoiceSearch(transcript)
    handleSearch(transcript)
  }, [onVoiceSearch, handleSearch])

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setQuery(value)
    setShowSuggestions(value.length > 0)
    setActiveIndex(-1)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions && suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : -1
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => 
          prev > -1 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleInputChange(suggestions[activeIndex].value)
          handleSearch(suggestions[activeIndex].value)
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        inputRef.current?.blur()
        break
    }
  }, [showSuggestions, suggestions, activeIndex, handleInputChange, handleSearch])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    handleInputChange(suggestion.value)
    handleSearch(suggestion.value)
  }, [handleInputChange, handleSearch])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Main Search Input */}
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(query.length > 0)}
            className="pl-10 pr-4 py-3 text-lg"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />
          
          {/* Medical Term Recognition Indicator */}
          {recognizedTerms.length > 0 && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="text-xs">
                🩺 {recognizedTerms.length} medical term{recognizedTerms.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center ml-2 space-x-1">
          {/* Location Search */}
          {showLocationSearch && (
            <Button
              variant="outline"
              size="icon"
              onClick={onLocationRequest}
              className="shrink-0"
              title="Use current location"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          )}

          {/* Voice Search */}
          {showVoiceSearch && (
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={handleVoiceSearch}
              className={cn(
                "shrink-0 transition-all",
                isListening && "animate-pulse"
              )}
              title={isListening ? "Stop listening" : "Voice search"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Filter Toggle */}
          {showFilters && (
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              title="Advanced filters"
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {/* Recent Searches */}
            {recentSearches.length > 0 && query === '' && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Recent Searches</h4>
                  {onClearRecent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearRecent}
                      className="h-auto p-1 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(search)}
                      className="h-auto py-1 px-2 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                      index === activeIndex && "bg-blue-50 text-blue-700"
                    )}
                    role="option"
                    aria-selected={index === activeIndex}
                  >
                    <div className="flex items-center">
                      <Search className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">{suggestion.displayValue}</div>
                        {suggestion.category && (
                          <div className="text-xs text-gray-500 capitalize">
                            {suggestion.category.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Medical Term Recognition Results */}
            {recognizedTerms.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Medical Terms Recognized</h4>
                <div className="flex flex-wrap gap-2">
                  {recognizedTerms.map((term, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {term}
                    </Badge>
                  ))}
                </div>
                {Object.keys(suggestedFilters).length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Suggested filters: {Object.keys(suggestedFilters).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* No Results State */}
            {query.length > 0 && suggestions.length === 0 && recognizedTerms.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No suggestions found</p>
                <p className="text-xs mt-1">
                  Try searching for medical services, specialties, or symptoms
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}