'use client'

import React, { useState, useEffect, useRef } from "react"
import { Search, Mic, X, Clock, TrendingUp, Stethoscope, User, Building, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DoctorSearchSuggestion {
  id: string
  text: string
  type: "doctor" | "specialty" | "condition" | "clinic" | "service" | "language"
  doctorName?: string
  specialty?: string
  clinicName?: string
  icon?: string
  color?: string
  category?: string
  description?: string
  subtext?: string
}

interface DoctorSearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: DoctorSearchSuggestion) => void
  placeholder?: string
  className?: string
  recentSearches?: string[]
  popularSearches?: string[]
  searchContext?: 'doctors' | 'clinics' | 'services'
  showVoiceSearch?: boolean
  enableFuzzySearch?: boolean
}

// Enhanced medical term database for doctor search
const doctorSearchTerms: DoctorSearchSuggestion[] = [
  // Doctor names (popular/specialized)
  { id: "1", text: "Dr. Sarah Johnson", type: "doctor", doctorName: "Dr. Sarah Johnson", specialty: "Cardiology", clinicName: "Heart Care Medical Centre", icon: "👩‍⚕️", color: "text-pink-600", description: "MBBS, MRCP, Cardiology Fellowship" },
  { id: "2", text: "Dr. Michael Chen", type: "doctor", doctorName: "Dr. Michael Chen", specialty: "Neurology", clinicName: "Neurological Institute", icon: "👨‍⚕️", color: "text-blue-600", description: "15 years experience in neurology" },
  { id: "3", text: "Dr. Lisa Wong", type: "doctor", doctorName: "Dr. Lisa Wong", specialty: "Dermatology", clinicName: "Skin Health Centre", icon: "👩‍⚕️", color: "text-purple-600", description: "Specializes in cosmetic dermatology" },
  { id: "4", text: "Dr. Raj Patel", type: "doctor", doctorName: "Dr. Raj Patel", specialty: "Orthopedics", clinicName: "Joint Care Hospital", icon: "👨‍⚕️", color: "text-green-600", description: "Joint replacement specialist" },
  
  // Medical specialties (Singapore MOH aligned)
  { id: "5", text: "Cardiology", type: "specialty", specialty: "Cardiology", icon: "❤️", color: "text-red-600", description: "Heart and cardiovascular system", subtext: "234 doctors available" },
  { id: "6", text: "Dermatology", type: "specialty", specialty: "Dermatology", icon: "🩺", color: "text-orange-600", description: "Skin, hair, and nail conditions", subtext: "189 doctors available" },
  { id: "7", text: "Neurology", type: "specialty", specialty: "Neurology", icon: "🧠", color: "text-purple-600", description: "Nervous system disorders", subtext: "156 doctors available" },
  { id: "8", text: "Orthopedics", type: "specialty", specialty: "Orthopedics", icon: "🦴", color: "text-blue-600", description: "Bones, joints, and muscles", subtext: "298 doctors available" },
  { id: "9", text: "Pediatrics", type: "specialty", specialty: "Pediatrics", icon: "👶", color: "text-pink-600", description: "Children's health", subtext: "167 doctors available" },
  { id: "10", text: "Psychiatry", type: "specialty", specialty: "Psychiatry", icon: "🧘", color: "text-teal-600", description: "Mental health and disorders", subtext: "145 doctors available" },
  { id: "11", text: "General Practice", type: "specialty", specialty: "General Practice", icon: "🏥", color: "text-green-600", description: "Primary healthcare", subtext: "456 doctors available" },
  { id: "12", text: "Ophthalmology", type: "specialty", specialty: "Ophthalmology", icon: "👁️", color: "text-indigo-600", description: "Eye care and vision", subtext: "134 doctors available" },
  { id: "13", text: "Gastroenterology", type: "specialty", specialty: "Gastroenterology", icon: "🫄", color: "text-orange-600", description: "Digestive system", subtext: "98 doctors available" },
  { id: "14", text: "Endocrinology", type: "specialty", specialty: "Endocrinology", icon: "🧪", color: "text-yellow-600", description: "Hormones and metabolism", subtext: "87 doctors available" },
  
  // Common conditions
  { id: "15", text: "Chest Pain", type: "condition", icon: "🫀", color: "text-red-600", description: "Heart-related chest discomfort", subtext: "Cardiology specialists" },
  { id: "16", text: "Skin Rash", type: "condition", icon: "🔴", color: "text-orange-600", description: "Skin irritation or inflammation", subtext: "Dermatology specialists" },
  { id: "17", text: "Back Pain", type: "condition", icon: "🦴", color: "text-blue-600", description: "Spine and muscle pain", subtext: "Orthopedics specialists" },
  { id: "18", text: "Headache", type: "condition", icon: "🤕", color: "text-purple-600", description: "Head and migraine pain", subtext: "Neurology specialists" },
  { id: "19", text: "Diabetes", type: "condition", icon: "💉", color: "text-green-600", description: "Blood sugar management", subtext: "Endocrinology specialists" },
  { id: "20", text: "Anxiety", type: "condition", icon: "😰", color: "text-teal-600", description: "Mental health support", subtext: "Psychiatry specialists" },
  { id: "21", text: "Eye Problems", type: "condition", icon: "👁️", color: "text-indigo-600", description: "Vision and eye health", subtext: "Ophthalmology specialists" },
  { id: "22", text: "Digestive Issues", type: "condition", icon: "🫄", color: "text-orange-600", description: "Stomach and digestive problems", subtext: "Gastroenterology specialists" },
  
  // Medical services
  { id: "23", text: "Annual Checkup", type: "service", icon: "📋", color: "text-green-600", description: "Complete health screening", subtext: "General Practice" },
  { id: "24", text: "Heart Consultation", type: "service", icon: "❤️", color: "text-red-600", description: "Cardiac assessment", subtext: "Cardiology" },
  { id: "25", text: "Skin Treatment", type: "service", icon: "🩺", color: "text-orange-600", description: "Dermatology procedures", subtext: "Dermatology" },
  { id: "26", text: "Mental Health Therapy", type: "service", icon: "🧘", color: "text-teal-600", description: "Psychological counseling", subtext: "Psychiatry" },
  { id: "27", text: "Eye Examination", type: "service", icon: "👁️", color: "text-indigo-600", description: "Vision and eye health check", subtext: "Ophthalmology" },
  { id: "28", text: "Joint Pain Treatment", type: "service", icon: "🦴", color: "text-blue-600", description: "Musculoskeletal care", subtext: "Orthopedics" },
  { id: "29", text: "Child Health Check", type: "service", icon: "👶", color: "text-pink-600", description: "Pediatric care", subtext: "Pediatrics" },
  { id: "30", text: "Emergency Consultation", type: "service", icon: "🚑", color: "text-red-600", description: "Urgent medical care", subtext: "Emergency Medicine" },
  
  // Languages
  { id: "31", text: "English speaking doctor", type: "language", icon: "🇬🇧", color: "text-blue-600", description: "English language consultation", subtext: "567 doctors" },
  { id: "32", text: "Mandarin speaking doctor", type: "language", icon: "🇨🇳", color: "text-red-600", description: "Chinese language consultation", subtext: "423 doctors" },
  { id: "33", text: "Malay speaking doctor", type: "language", icon: "🇲🇾", color: "text-green-600", description: "Malay language consultation", subtext: "234 doctors" },
  { id: "34", text: "Tamil speaking doctor", type: "language", icon: "🇮🇳", color: "text-orange-600", description: "Tamil language consultation", subtext: "187 doctors" },
  
  // Clinic types/locations
  { id: "35", text: "Heart Care Medical Centre", type: "clinic", clinicName: "Heart Care Medical Centre", icon: "🏥", color: "text-red-600", description: "Cardiology specialist clinic" },
  { id: "36", text: "Skin Health Centre", type: "clinic", clinicName: "Skin Health Centre", icon: "🩺", color: "text-orange-600", description: "Dermatology clinic" },
  { id: "37", text: "City General Hospital", type: "clinic", clinicName: "City General Hospital", icon: "🏥", color: "text-blue-600", description: "Multi-specialty hospital" },
  { id: "38", text: "Downtown Polyclinic", type: "clinic", clinicName: "Downtown Polyclinic", icon: "🏢", color: "text-green-600", description: "Government polyclinic" },
]

export function DoctorSearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search for doctors, specialties, conditions, or services...",
  className,
  recentSearches = [],
  popularSearches = [],
  searchContext = 'doctors',
  showVoiceSearch = true,
  enableFuzzySearch = true
}: DoctorSearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<DoctorSearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Enhanced fuzzy matching algorithm
  const fuzzyMatch = (text: string, query: string): number => {
    if (!query) return 0
    
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()
    
    if (textLower.includes(queryLower)) {
      // Exact substring match
      return 1.0
    }
    
    // Fuzzy matching with scoring
    let score = 0
    let textIndex = 0
    let queryIndex = 0
    
    while (textIndex < textLower.length && queryIndex < queryLower.length) {
      if (textLower[textIndex] === queryLower[queryIndex]) {
        score += 1
        queryIndex++
      }
      textIndex++
    }
    
    // Bonus for matches at the beginning
    if (textLower.startsWith(queryLower)) {
      score += 2
    }
    
    // Normalize score
    return Math.min(score / queryLower.length, 0.8)
  }

  // Filter suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSuggestions([])
      setIsOpen(false)
      return
    }

    const query = value.toLowerCase()
    let filtered: DoctorSearchSuggestion[] = []

    // Filter and score all terms
    const scoredTerms = doctorSearchTerms
      .map(term => ({
        ...term,
        score: enableFuzzySearch 
          ? fuzzyMatch(term.text, query)
          : term.text.toLowerCase().includes(query) ? 1 : 0
      }))
      .filter(term => term.score > 0)
      .sort((a, b) => b.score - a.score)

    filtered = scoredTerms.slice(0, 12)

    // Add recent searches that match
    const recentMatches = recentSearches
      .filter(search => 
        search.toLowerCase().includes(query) && 
        !filtered.find(f => f.text === search)
      )
      .map(search => ({
        id: `recent-${search}`,
        text: search,
        type: "recent" as const,
        description: "Recent search",
        color: "text-gray-600"
      }))

    // Add context-specific suggestions
    if (searchContext === 'doctors') {
      // Boost doctor-related results
      filtered = [
        ...filtered.filter(s => s.type === 'doctor'),
        ...recentMatches,
        ...filtered.filter(s => s.type !== 'doctor')
      ]
    }

    setFilteredSuggestions([...filtered])
    setIsOpen(true)
    setSelectedIndex(-1)
  }, [value, recentSearches, searchContext, enableFuzzySearch])

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

  const handleSelect = (suggestion: DoctorSearchSuggestion) => {
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

  const getSuggestionIcon = (suggestion: DoctorSearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon
    if (suggestion.type === "recent") return <Clock className="h-4 w-4 text-gray-400" />
    if (suggestion.type === "doctor") return <User className="h-4 w-4 text-blue-600" />
    if (suggestion.type === "specialty") return <Stethoscope className="h-4 w-4 text-red-600" />
    if (suggestion.type === "clinic") return <Building className="h-4 w-4 text-green-600" />
    if (suggestion.type === "condition") return <Heart className="h-4 w-4 text-orange-600" />
    return "🔍"
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'doctor': return 'Doctor'
      case 'specialty': return 'Specialty'
      case 'condition': return 'Condition'
      case 'clinic': return 'Clinic'
      case 'service': return 'Service'
      case 'language': return 'Language'
      case 'recent': return 'Recent'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'doctor': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'specialty': return 'bg-red-50 text-red-700 border-red-200'
      case 'condition': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'clinic': return 'bg-green-50 text-green-700 border-green-200'
      case 'service': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'language': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'recent': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
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
          {showVoiceSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              className={cn(
                "h-8 w-8 p-0",
                isListening && "text-red-500 bg-red-50 animate-pulse"
              )}
              title="Voice Search"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="h-8 w-8 p-0"
              title="Clear search"
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
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg max-h-96 overflow-hidden"
        >
          <ScrollArea className="max-h-96">
            <div className="p-2">
              {value && (
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b mb-2">
                  Search Results ({filteredSuggestions.length})
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
                  <span className="text-lg">{getSuggestionIcon(suggestion)}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-medium truncate">{suggestion.text}</div>
                    {suggestion.description && (
                      <div className="text-sm text-muted-foreground truncate">
                        {suggestion.description}
                      </div>
                    )}
                    {suggestion.subtext && (
                      <div className="text-xs text-muted-foreground">
                        {suggestion.subtext}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs px-1.5 py-0.5", getTypeColor(suggestion.type))}>
                        {getTypeLabel(suggestion.type)}
                      </Badge>
                      {suggestion.doctorName && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.specialty}
                        </span>
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
                      type: "recent",
                      description: "Popular search"
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

export type { DoctorSearchSuggestion, DoctorSearchAutocompleteProps }