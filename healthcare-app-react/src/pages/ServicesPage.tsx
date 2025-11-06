import React, { useState, useMemo } from 'react'
import { Search, Filter, Clock, DollarSign, Loader2, ChevronDown } from 'lucide-react'
import { useServices, useServiceCategories, useSearchServices } from '../hooks/useSupabase'

const ServicesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const { data: allServices, isLoading: servicesLoading } = useServices()
  const { data: categories, isLoading: categoriesLoading } = useServiceCategories()
  const { data: searchResults, isLoading: searchLoading } = useSearchServices(
    searchQuery,
    selectedCategory || undefined
  )

  // Use search results if searching, otherwise use all services
  const services = searchQuery || selectedCategory ? searchResults : allServices

  // Group services by category for better display
  const servicesByCategory = useMemo(() => {
    if (!services) return {}
    
    return services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    }, {} as Record<string, typeof services>)
  }, [services])

  const isLoading = servicesLoading || categoriesLoading || searchLoading

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Medical Services</h1>
          <p className="text-gray-600">
            Comprehensive healthcare services for you and your family
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="">All Categories</option>
                {categories?.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading services...</span>
          </div>
        ) : !services || services.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Found {services.length} service{services.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedCategory && ` in ${selectedCategory}`}
              </p>
            </div>

            {/* Services Display */}
            {selectedCategory || searchQuery ? (
              // Grid view when filtering
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              // Grouped by category view
              <div className="space-y-8">
                {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Service Card Component
const ServiceCard = ({ service }: { service: any }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {service.image_url && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={service.image_url} 
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {service.category}
          </span>
        </div>
        
        {/* Service Name */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
        
        {/* Description */}
        <p className={`text-gray-600 mb-4 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {service.description}
        </p>
        
        {service.description && service.description.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
        
        {/* Details */}
        <div className="space-y-2 mb-4 pt-4 border-t border-gray-100">
          {service.duration_minutes && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>Duration:</span>
              </div>
              <span className="text-gray-900 font-medium">
                {service.duration_minutes} min
              </span>
            </div>
          )}
          {service.price_range && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-gray-500">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Price Range:</span>
              </div>
              <span className="text-gray-900 font-medium">
                {service.price_range}
              </span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Book Service
        </button>
      </div>
    </div>
  )
}

export default ServicesPage
