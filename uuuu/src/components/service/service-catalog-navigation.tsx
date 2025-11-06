"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Search, MapPin, Star, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ServiceCard } from "@/components/healthcare/service-card"

interface ServiceCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  subcategories?: ServiceCategory[]
  services?: Service[]
}

interface Service {
  id: string
  name: string
  description: string
  category: string
  duration?: string
  price?: string
  available?: boolean
  popular?: boolean
  featured?: boolean
  trending?: boolean
  clinic?: string
  location?: {
    address: string
    distance?: number
  }
  requirements?: string[]
}

interface ServiceCatalogNavigationProps {
  categories: ServiceCategory[]
  services: Service[]
  onServiceSelect: (service: Service) => void
  onCategorySelect: (categoryId: string) => void
  selectedCategory?: string
  recentServices?: Service[]
  popularServices?: Service[]
  featuredServices?: Service[]
  userLocation?: { lat: number; lng: number }
  healthProfile?: {
    age?: number
    conditions?: string[]
    preferences?: string[]
  }
}

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  "cardiology": "❤️",
  "dermatology": "🩺",
  "pediatrics": "👶",
  "orthopedics": "🦴",
  "neurology": "🧠",
  "oncology": "🎗️",
  "general": "🏥",
  "emergency": "🚑",
  "surgery": "⚕️",
  "diagnostics": "🔬",
  "therapy": "💆",
  "mental-health": "🧘"
}

// Healthcare color scheme
const categoryColors: Record<string, string> = {
  "cardiology": "bg-red-50 text-red-700 border-red-200",
  "dermatology": "bg-orange-50 text-orange-700 border-orange-200",
  "pediatrics": "bg-pink-50 text-pink-700 border-pink-200",
  "orthopedics": "bg-blue-50 text-blue-700 border-blue-200",
  "neurology": "bg-purple-50 text-purple-700 border-purple-200",
  "oncology": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "general": "bg-green-50 text-green-700 border-green-200",
  "emergency": "bg-red-100 text-red-800 border-red-300",
  "surgery": "bg-violet-50 text-violet-700 border-violet-200",
  "diagnostics": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "therapy": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "mental-health": "bg-teal-50 text-teal-700 border-teal-200"
}

export function ServiceCatalogNavigation({
  categories,
  services,
  onServiceSelect,
  onCategorySelect,
  selectedCategory,
  recentServices = [],
  popularServices = [],
  featuredServices = [],
  userLocation,
  healthProfile
}: ServiceCatalogNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>(services)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonServices, setComparisonServices] = useState<Service[]>([])
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([])

  // Filter services based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      service.requirements?.some(req => req.toLowerCase().includes(query))
    )
    setFilteredServices(filtered)
  }, [searchQuery, services])

  // Generate recommendations based on health profile
  useEffect(() => {
    if (healthProfile && services.length > 0) {
      const recommendations = services
        .filter(service => {
          // Age-based recommendations
          if (healthProfile.age && service.category === "pediatrics" && healthProfile.age < 18) {
            return true
          }
          if (healthProfile.age && healthProfile.age > 65 && service.category === "geriatrics") {
            return true
          }

          // Condition-based recommendations
          if (healthProfile.conditions?.includes("diabetes") && 
              (service.name.toLowerCase().includes("diabetes") || service.category === "endocrinology")) {
            return true
          }

          // Preventive care recommendations
          if (service.category === "general" && 
              (service.name.toLowerCase().includes("checkup") || 
               service.name.toLowerCase().includes("screening"))) {
            return true
          }

          return false
        })
        .slice(0, 6)
      setRecommendedServices(recommendations)
    }
  }, [healthProfile, services])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId)
    toggleCategory(categoryId)
  }

  const addToComparison = (service: Service) => {
    if (comparisonServices.length < 3 && !comparisonServices.find(s => s.id === service.id)) {
      setComparisonServices(prev => [...prev, service])
    }
  }

  const removeFromComparison = (serviceId: string) => {
    setComparisonServices(prev => prev.filter(s => s.id !== serviceId))
  }

  const renderCategoryTree = (categories: ServiceCategory[], level = 0) => {
    return categories.map(category => {
      const isExpanded = expandedCategories.includes(category.id)
      const hasSubcategories = category.subcategories && category.subcategories.length > 0
      const colorClass = categoryColors[category.id.toLowerCase()] || categoryColors["general"]

      return (
        <div key={category.id} className={cn("w-full", level > 0 && "ml-4")}>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-auto p-3 text-left",
                  selectedCategory === category.id && "bg-primary/10"
                )}
                onClick={() => handleCategoryClick(category.id)}
              >
                {hasSubcategories && (
                  <div className="shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                )}
                
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0",
                  colorClass
                )}>
                  {categoryIcons[category.id.toLowerCase()] || "🏥"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {category.description}
                    </div>
                  )}
                </div>
                
                <Badge variant="secondary" className="shrink-0">
                  {category.services?.length || 0}
                </Badge>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              {hasSubcategories && (
                <div className="mt-1">
                  {renderCategoryTree(category.subcategories!, level + 1)}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )
    })
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Category Tree */}
      <div className="w-80 border-r bg-background shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">Service Categories</h2>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4 space-y-2">
            {renderCategoryTree(categories)}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm">
            <Button variant="ghost" size="sm" onClick={() => onCategorySelect("")}>
              All Services
            </Button>
            {selectedCategory && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                </span>
              </>
            )}
          </nav>

          {/* Featured Services Carousel */}
          {featuredServices.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredServices.slice(0, 6).map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBookService={() => onServiceSelect(service)}
                    onLearnMore={() => onServiceSelect(service)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Popular Services Dashboard */}
          {popularServices.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Popular Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularServices.slice(0, 6).map(service => (
                  <div key={service.id} className="relative">
                    <ServiceCard
                      service={service}
                      onBookService={() => onServiceSelect(service)}
                      onLearnMore={() => onServiceSelect(service)}
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Popular
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Personalized Recommendations */}
          {recommendedServices.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4">
                Recommended for You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBookService={() => onServiceSelect(service)}
                    onLearnMore={() => onServiceSelect(service)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Services Near Me */}
          {userLocation && services.filter(s => s.location).length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Services Near You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services
                  .filter(s => s.location && s.location.distance)
                  .sort((a, b) => (a.location?.distance || 0) - (b.location?.distance || 0))
                  .slice(0, 6)
                  .map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onBookService={() => onServiceSelect(service)}
                      onLearnMore={() => onServiceSelect(service)}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* Recently Viewed */}
          {recentServices.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4">
                Recently Viewed
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentServices.slice(0, 3).map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBookService={() => onServiceSelect(service)}
                    onLearnMore={() => onServiceSelect(service)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Services */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {searchQuery ? `Search Results (${filteredServices.length})` : "All Services"}
              </h3>
              {filteredServices.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                  disabled={comparisonServices.length === 0}
                >
                  Compare ({comparisonServices.length})
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(service => (
                <div key={service.id} className="relative">
                  <ServiceCard
                    service={service}
                    onBookService={() => onServiceSelect(service)}
                    onLearnMore={() => onServiceSelect(service)}
                  />
                  {comparisonServices.length < 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 left-2"
                      onClick={() => addToComparison(service)}
                    >
                      Compare
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No services found matching your search.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>

      {/* Service Comparison Sidebar */}
      {showComparison && comparisonServices.length > 0 && (
        <div className="w-80 border-l bg-background shrink-0">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Service Comparison</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComparison(false)}
              >
                ×
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="p-4 space-y-4">
              {comparisonServices.map(service => (
                <Card key={service.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm">{service.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromComparison(service.id)}
                    >
                      ×
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {service.description}
                  </p>
                  <div className="space-y-1 text-xs">
                    {service.duration && (
                      <div>Duration: {service.duration}</div>
                    )}
                    {service.price && (
                      <div>Price: {service.price}</div>
                    )}
                    <div>Category: {service.category}</div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}