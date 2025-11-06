"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, Mic, X, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchSuggestion {
  id: string
  text: string
  type: "service" | "category" | "condition" | "clinic"
  icon?: string
  color?: string
  category?: string
}

interface MedicalSearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: SearchSuggestion) => void
  placeholder?: string
  className?: string
  recentSearches?: string[]
  popularSearches?: string[]
}

// Medical term database for autocomplete
const medicalTerms: SearchSuggestion[] = [
  // Common symptoms
  { id: "1", text: "Chest Pain", type: "condition", icon: "🫀", color: "text-red-600" },
  { id: "2", text: "Headache", type: "condition", icon: "🤕", color: "text-purple-600" },
  { id: "3", text: "Back Pain", type: "condition", icon: "🦴", color: "text-blue-600" },
  { id: "4", text: "Skin Rash", type: "condition", icon: "🔴", color: "text-orange-600" },
  { id: "5", text: "Fever", type: "condition", icon: "🌡️", color: "text-red-600" },
  { id: "6", text: "Cough", type: "condition", icon: "😷", color: "text-blue-600" },
  { id: "7", text: "Sore Throat", type: "condition", icon: "😶", color: "text-pink-600" },
  { id: "8", text: "Nausea", type: "condition", icon: "🤢", color: "text-green-600" },
  { id: "9", text: "Fatigue", type: "condition", icon: "😴", color: "text-yellow-600" },
  { id: "10", text: "Anxiety", type: "condition", icon: "😰", color: "text-purple-600" },
  
  // Service types
  { id: "11", text: "Annual Checkup", type: "service", icon: "📋", color: "text-green-600" },
  { id: "12", text: "Vaccination", type: "service", icon: "💉", color: "text-blue-600" },
  { id: "13", text: "Blood Test", type: "service", icon: "🩸", color: "text-red-600" },
  { id: "14", text: "X-Ray", type: "service", icon: "📷", color: "text-purple-600" },
  { id: "15", text: "MRI Scan", type: "service", icon: "🖼️", color: "text-indigo-600" },
  { id: "16", text: "Physical Therapy", type: "service", icon: "💪", color: "text-orange-600" },
  { id: "17", text: "Mental Health Consultation", type: "service", icon: "🧠", color: "text-purple-600" },
  { id: "18", text: "Dental Cleaning", type: "service", icon: "🦷", color: "text-blue-600" },
  { id: "19", text: "Eye Exam", type: "service", icon: "👁️", color: "text-green-600" },
  { id: "20", text: "Emergency Care", type: "service", icon: "🚑", color: "text-red-600" },
  
  // Categories
  { id: "21", text: "Cardiology", type: "category", icon: "❤️", color: "text-red-600" },
  { id: "22", text: "Dermatology", type: "category", icon: "🩺", color: "text-orange-600" },
  { id: "23", text: "Pediatrics", type: "category", icon: "👶", color: "text-pink-600" },
  { id: "24", text: "Orthopedics", type: "category", icon: "🦴", color: "text-blue-600" },
  { id: "25", text: "Neurology", type: "category", icon: "🧠", color: "text-purple-600" },
  { id: "26", text: "Oncology", type: "category", icon: "🎗️", color: "text-indigo-600" },
  { id: "27", text: "General Practice", type: "category", icon: "🏥", color: "text-green-600" },
  { id: "28", text: "Emergency Medicine", type: "category", icon: "🚑", color: "text-red-600" },
  { id: "29", text: "Surgery", type: "category", icon: "⚕️", color: "text-violet-600" },
  { id: "30", text: "Diagnostics", type: "category", icon: "🔬", color: "text-cyan-600" },
  { id: "31", text: "Therapy", type: "category", icon: "💆", color: "text-emerald-600" },
  { id: "32", text: "Mental Health", type: "category", icon: "🧘", color: "text-teal-600" },
  
  // Specialists
  { id: "33", text: "Dr. Smith", type: "clinic", icon: "👨‍⚕️", color: "text-blue-600" },
  { id: "34", text: "Dr. Johnson", type: "clinic", icon: "👩‍⚕️", color: "text-pink-600" },
  { id: "35", text: "Downtown Clinic", type: "clinic", icon: "🏢", color: "text-green-600" },
  { id: "36", text: "City Hospital", type: "clinic", icon: "🏥", color: "text-red-600" },
  { id: "37", text: "Wellness Center", type: "clinic", icon: "🌟", color: "text-yellow-600" },
]

export function MedicalSearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search for symptoms, services, or specialists...",
  className,
  recentSearches = [],
  popularSearches = []
}: MedicalSearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSuggestions([])
      setIsOpen(false)
      return
    }

    const query = value.toLowerCase()
    const filtered = medicalTerms.filter(term =>
      term.text.toLowerCase().includes(query) ||
      term.type.toLowerCase().includes(query)
    )

    // Add recent searches to top if they match
    const recentMatches = recentSearches
      .filter(search => search.toLowerCase().includes(query) && !filtered.find(f => f.text === search))
      .map(search => ({
        id: `recent-${search}`,
        text: search,
        type: "recent" as const
      }))

    setFilteredSuggestions([...recentMatches, ...filtered.slice(0, 8)])
    setIsOpen(true)
    setSelectedIndex(-1)
  }, [value, recentSearches])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSelect(filteredSuggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelect = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text)
    onSelect(suggestion)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsListening(true)
      
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        onChange(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon
    if (suggestion.type === "recent") return <Clock className="h-4 w-4 text-gray-400" />
    return "🔍"
  }

  const getSuggestionColor = (suggestion: SearchSuggestion) => {
    return suggestion.color || "text-gray-600"
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-20"
        />
        <div className="absolute right-2 top-2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceSearch}
            className={cn(
              "h-8 w-8 p-0",
              isListening && "text-red-500 bg-red-50"
            )}
          >
            <Mic className="h-4 w-4" />
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg max-h-80 overflow-hidden"
        >
          <ScrollArea className="max-h-80">
            <div className="p-2">
              {value && (
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b mb-2">
                  Search Results
                </div>
              )}
              
              {filteredSuggestions.map((suggestion, index) => (
                <Button
                  key={suggestion.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-auto p-3 text-left",
                    selectedIndex === index && "bg-accent"
                  )}
                  onClick={() => handleSelect(suggestion)}
                >
                  <span className={cn("text-lg", getSuggestionColor(suggestion))}>
                    {getSuggestionIcon(suggestion)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{suggestion.text}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {suggestion.type}
                      </Badge>
                      {suggestion.category && (
                        <span>{suggestion.category}</span>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Popular searches */}
      {isOpen && !value && popularSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Popular Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    onChange(search)
                    onSelect({
                      id: `popular-${index}`,
                      text: search,
                      type: "popular"
                    })
                  }}
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { SearchSuggestion }