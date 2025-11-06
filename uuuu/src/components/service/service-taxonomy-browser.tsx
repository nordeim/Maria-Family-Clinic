'use client'

import { useState, useMemo } from 'react'
import { api } from '@/lib/trpc/client'
import { ServiceCategory } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceTaxonomyNode, ServiceWithRelations } from '@/types/service-taxonomy'
import { 
  Search, 
  Filter, 
  Heart, 
  Stethoscope, 
  Baby, 
  Brain, 
  Eye, 
  Smile,
  Users,
  Shield,
  Zap,
  FileText,
  Activity,
  Syringe,
  UserCheck,
  Home,
  Video
} from 'lucide-react'

interface ServiceTaxonomyBrowserProps {
  onServiceSelect?: (service: ServiceWithRelations) => void
  className?: string
}

const categoryIcons: Record<ServiceCategory, React.ComponentType<any>> = {
  GENERAL_PRACTICE: Stethoscope,
  CARDIOLOGY: Heart,
  DERMATOLOGY: Users,
  ORTHOPEDICS: Activity,
  PEDIATRICS: Baby,
  WOMENS_HEALTH: Shield,
  MENTAL_HEALTH: Brain,
  DENTAL_CARE: Smile,
  EYE_CARE: Eye,
  EMERGENCY_SERVICES: Zap,
  PREVENTIVE_CARE: Shield,
  DIAGNOSTICS: FileText,
  PROCEDURES: Activity,
  VACCINATION: Syringe,
  SPECIALIST_CONSULTATIONS: UserCheck,
  REHABILITATION: Activity,
  HOME_HEALTHCARE: Home,
  TELEMEDICINE: Video,
}

export default function ServiceTaxonomyBrowser({ 
  onServiceSelect, 
  className = '' 
}: ServiceTaxonomyBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'complexity'>('name')

  // Fetch taxonomy data
  const { data: taxonomyData, isLoading } = api.serviceTaxonomy.getTaxonomy.useQuery({
    includeInactive: false,
    language: 'en',
  })

  // Fetch search results
  const { data: searchResults } = api.serviceTaxonomy.search.useQuery({
    query: searchQuery || 'consultation',
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    subcategory: selectedSubcategory === 'all' ? undefined : selectedSubcategory,
    limit: 20,
    sortBy,
  })

  // Filter and process data
  const processedData = useMemo(() => {
    if (!taxonomyData) return []

    return taxonomyData.map((categoryNode: ServiceTaxonomyNode) => {
      const IconComponent = categoryIcons[categoryNode.category] || Stethoscope
      
      // Filter subcategories based on search query
      const filteredSubcategories = categoryNode.subcategories.filter(subcategory => {
        if (!searchQuery) return true
        
        const searchLower = searchQuery.toLowerCase()
        return (
          subcategory.subcategory.toLowerCase().includes(searchLower) ||
          subcategory.services.some(service => 
            service.name.toLowerCase().includes(searchLower) ||
            service.description?.toLowerCase().includes(searchLower) ||
            service.searchTerms?.some(term => term.toLowerCase().includes(searchLower))
          )
        )
      })

      // Sort services within subcategories
      const sortedSubcategories = filteredSubcategories.map(subcategory => ({
        ...subcategory,
        services: [...subcategory.services].sort((a, b) => {
          if (sortBy === 'price') return (a.basePrice || 0) - (b.basePrice || 0)
          if (sortBy === 'complexity') return a.complexityLevel.localeCompare(b.complexityLevel)
          return a.name.localeCompare(b.name)
        })
      }))

      return {
        ...categoryNode,
        subcategories: sortedSubcategories,
        serviceCount: sortedSubcategories.reduce((sum, sub) => sum + sub.services.length, 0),
      }
    }).filter(category => category.serviceCount > 0)
  }, [taxonomyData, searchQuery, sortBy])

  const handleServiceClick = (service: ServiceWithRelations) => {
    if (onServiceSelect) {
      onServiceSelect(service)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'BASIC': return 'bg-green-100 text-green-800'
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLEX': return 'bg-orange-100 text-orange-800'
      case 'SPECIALIZED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Healthcare Service Taxonomy
        </h1>
        <p className="text-gray-600">
          Comprehensive healthcare services for Singapore healthcare system
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search services, conditions, or procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select 
            value={selectedCategory} 
            onValueChange={(value) => {
              setSelectedCategory(value as ServiceCategory | 'all')
              setSelectedSubcategory('all')
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryIcons).map(([key, IconComponent]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'name' | 'price' | 'complexity') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="complexity">Complexity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <Tabs defaultValue="taxonomy" className="w-full">
        <TabsList>
          <TabsTrigger value="taxonomy">Browse Taxonomy</TabsTrigger>
          <TabsTrigger value="search">Search Results ({searchResults?.total || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="taxonomy" className="mt-6">
          <div className="space-y-6">
            {processedData.map((categoryNode) => {
              const IconComponent = categoryIcons[categoryNode.category] || Stethoscope
              
              return (
                <Card key={categoryNode.category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{categoryNode.categoryName}</CardTitle>
                          <CardDescription>
                            {categoryNode.description} • {categoryNode.serviceCount} services
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={categoryNode.isSubsidized ? "default" : "secondary"}>
                          {categoryNode.isSubsidized ? "Subsidized" : "Private"}
                        </Badge>
                        <Badge variant="outline">
                          S${categoryNode.averagePrice.toFixed(0)} avg
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {categoryNode.subcategories.map((subcategory) => (
                        <div key={subcategory.subcategory} className="border-l-2 border-gray-200 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {subcategory.subcategory}
                            <Badge variant="outline" className="ml-2">
                              {subcategory.services.length}
                            </Badge>
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {subcategory.services.map((service) => (
                              <Card 
                                key={service.id} 
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleServiceClick(service)}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <h5 className="font-medium text-sm line-clamp-2">
                                        {service.name}
                                      </h5>
                                      {service.isHealthierSGCovered && (
                                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                                          Healthier SG
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {service.description && (
                                      <p className="text-xs text-gray-600 line-clamp-2">
                                        {service.description}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex gap-1">
                                        <Badge 
                                          variant="outline" 
                                          className={getComplexityColor(service.complexityLevel)}
                                        >
                                          {service.complexityLevel}
                                        </Badge>
                                        {service.typicalDurationMin && (
                                          <Badge variant="outline" className="text-xs">
                                            {service.typicalDurationMin}min
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {service.basePrice && (
                                        <span className="text-sm font-medium">
                                          S${service.basePrice}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          {searchResults && searchResults.data.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Search Results for "{searchResults.query}"
                </h3>
                <Badge variant="outline">
                  {searchResults.total} services found
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.data.map((service) => (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleServiceClick(service)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{service.name}</h4>
                          {service.searchScore && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(service.searchScore)}% match
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Badge 
                              variant="outline" 
                              className={getComplexityColor(service.complexityLevel)}
                            >
                              {service.complexityLevel}
                            </Badge>
                          </div>
                          
                          {service.basePrice && (
                            <span className="text-sm font-medium">
                              S${service.basePrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No services found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}