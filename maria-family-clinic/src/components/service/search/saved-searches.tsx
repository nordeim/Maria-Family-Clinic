'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Search, 
  Clock, 
  Bell, 
  BellOff, 
  Star, 
  Edit2, 
  Trash2, 
  Share,
  Download,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SavedSearch, SearchFilters } from '@/types/search'
import { medicalTermRecognizer } from '@/lib/medical-terms'

interface SavedSearchesProps {
  onLoadSearch: (search: SavedSearch) => void
  onDeleteSearch: (id: string) => void
  onUpdateSearch: (id: string, updates: Partial<SavedSearch>) => void
  className?: string
}

const STORAGE_KEY = 'clinic-saved-searches'

export function SavedSearches({
  onLoadSearch,
  onDeleteSearch,
  onUpdateSearch,
  className
}: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newSearchName, setNewSearchName] = useState('')
  const [newSearchFilters, setNewSearchFilters] = useState<SearchFilters>({})

  // Load saved searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSavedSearches(parsed)
      } catch (error) {
        console.error('Failed to parse saved searches:', error)
      }
    }
  }, [])

  // Save searches to localStorage
  const saveToStorage = (searches: SavedSearch[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
    setSavedSearches(searches)
  }

  // Create new saved search
  const createSavedSearch = () => {
    if (!newSearchName.trim() || Object.keys(newSearchFilters).length === 0) {
      return
    }

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: newSearchName.trim(),
      filters: newSearchFilters,
      alertEnabled: false,
      createdAt: new Date(),
      resultCount: 0,
      searchCount: 0
    }

    const updated = [...savedSearches, newSearch]
    saveToStorage(updated)
    
    setNewSearchName('')
    setNewSearchFilters({})
    setShowCreateForm(false)
  }

  // Update existing saved search
  const updateSavedSearch = (id: string, updates: Partial<SavedSearch>) => {
    const updated = savedSearches.map(search => 
      search.id === id ? { ...search, ...updates } : search
    )
    saveToStorage(updated)
    onUpdateSearch(id, updates)
    setEditingId(null)
  }

  // Delete saved search
  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(search => search.id !== id)
    saveToStorage(updated)
    onDeleteSearch(id)
  }

  // Toggle alert for saved search
  const toggleAlert = (id: string) => {
    const search = savedSearches.find(s => s.id === id)
    if (search) {
      updateSavedSearch(id, { alertEnabled: !search.alertEnabled })
    }
  }

  // Get search summary text
  const getSearchSummary = (filters: SearchFilters): string => {
    const parts: string[] = []
    
    if (filters.services?.length) {
      parts.push(`${filters.services.length} specialty${filters.services.length > 1 ? 'ies' : ''}`)
    }
    if (filters.urgency?.length) {
      parts.push(filters.urgency.join(', '))
    }
    if (filters.patientTypes?.length) {
      parts.push(filters.patientTypes.join(', '))
    }
    if (filters.location) {
      parts.push(`near me`)
    }
    
    return parts.join(' • ') || 'All services'
  }

  // Get last used time
  const getLastUsedTime = (search: SavedSearch): string => {
    if (!search.lastUsed) return 'Never used'
    
    const now = new Date()
    const lastUsed = new Date(search.lastUsed)
    const diffMs = now.getTime() - lastUsed.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    
    return lastUsed.toLocaleDateString()
  }

  // Get medical terms from filters
  const getMedicalTerms = (filters: SearchFilters): string[] => {
    const terms: string[] = []
    
    if (filters.services) {
      terms.push(...filters.services)
    }
    if (filters.medicalTerms) {
      terms.push(...filters.medicalTerms)
    }
    
    return [...new Set(terms)]
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Saved Searches
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            disabled={Object.keys(newSearchFilters).length === 0}
          >
            <Save className="w-4 h-4 mr-1" />
            Save Current
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create New Saved Search Form */}
        {showCreateForm && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="search-name">Search Name</Label>
                  <Input
                    id="search-name"
                    placeholder="e.g., Pediatric Dermatology Near Me"
                    value={newSearchName}
                    onChange={(e) => setNewSearchName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Filters to save:</div>
                  <div>{getSearchSummary(newSearchFilters)}</div>
                  {getMedicalTerms(newSearchFilters).length > 0 && (
                    <div className="mt-1">
                      Medical terms: {getMedicalTerms(newSearchFilters).join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-alert" />
                  <Label htmlFor="enable-alert" className="text-sm">
                    Enable alerts for new results
                  </Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewSearchName('')
                      setNewSearchFilters({})
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={createSavedSearch}
                    disabled={!newSearchName.trim()}
                  >
                    Save Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Searches List */}
        <div className="space-y-3">
          {savedSearches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No saved searches yet</p>
              <p className="text-sm mt-1">
                Search for services and save your filters for quick access
              </p>
            </div>
          ) : (
            savedSearches.map((search) => (
              <Card key={search.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {editingId === search.id ? (
                          <Input
                            value={search.name}
                            onChange={(e) => {
                              const updated = savedSearches.map(s => 
                                s.id === search.id 
                                  ? { ...s, name: e.target.value }
                                  : s
                              )
                              saveToStorage(updated)
                            }}
                            className="text-sm font-medium"
                            onBlur={() => setEditingId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingId(null)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <>
                            <h4 className="text-sm font-medium truncate">
                              {search.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {search.searchCount} searches
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-gray-600 mb-2">
                        {getSearchSummary(search.filters)}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {getLastUsedTime(search)}
                        </div>
                        {search.resultCount > 0 && (
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {search.resultCount} results
                          </div>
                        )}
                      </div>

                      {/* Medical Terms Badge */}
                      {getMedicalTerms(search.filters).length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {getMedicalTerms(search.filters).slice(0, 3).map((term, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                🩺 {term}
                              </Badge>
                            ))}
                            {getMedicalTerms(search.filters).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{getMedicalTerms(search.filters).length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAlert(search.id)}
                        className="w-8 h-8"
                        title={search.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
                      >
                        {search.alertEnabled ? (
                          <Bell className="w-4 h-4 text-blue-600" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(search.id)}
                        className="w-8 h-8"
                        title="Edit name"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onLoadSearch(search)}
                        className="w-8 h-8"
                        title="Load search"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSavedSearch(search.id)}
                        className="w-8 h-8 text-red-600 hover:text-red-700"
                        title="Delete saved search"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Alert Status */}
                  {search.alertEnabled && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center text-xs text-blue-600">
                        <Bell className="w-3 h-3 mr-1" />
                        Alerts enabled - You'll be notified of new matching services
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        {savedSearches.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-700">Quick Actions</h5>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export searches as JSON
                    const dataStr = JSON.stringify(savedSearches, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `saved-searches-${new Date().toISOString().split('T')[0]}.json`
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear all saved searches
                    if (confirm('Are you sure you want to delete all saved searches?')) {
                      saveToStorage([])
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}