"use client"

import React, { useState } from "react"
import { Plus, X, ArrowRight, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Service {
  id: string
  name: string
  description: string
  category: string
  duration?: string
  price?: string
  available?: boolean
  clinic?: string
  rating?: number
  requirements?: string[]
  coverage?: string[]
  waitingTime?: string
}

interface ServiceComparisonToolProps {
  services: Service[]
  onServiceAdd?: (service: Service) => void
  onServiceRemove?: (serviceId: string) => void
  maxComparisons?: number
  className?: string
}

export function ServiceComparisonTool({
  services,
  onServiceAdd,
  onServiceRemove,
  maxComparisons = 3,
  className
}: ServiceComparisonToolProps) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [showAddService, setShowAddService] = useState(false)

  const addService = (service: Service) => {
    if (selectedServices.length < maxComparisons && !selectedServices.find(s => s.id === service.id)) {
      const updated = [...selectedServices, service]
      setSelectedServices(updated)
      if (onServiceAdd) {
        onServiceAdd(service)
      }
    }
  }

  const removeService = (serviceId: string) => {
    const updated = selectedServices.filter(s => s.id !== serviceId)
    setSelectedServices(updated)
    if (onServiceRemove) {
      onServiceRemove(serviceId)
    }
  }

  const availableServices = services.filter(
    service => !selectedServices.find(selected => selected.id === service.id)
  )

  if (selectedServices.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Compare Healthcare Services</h3>
            <p className="text-sm text-muted-foreground">
              Select up to {maxComparisons} services to compare their features, pricing, and availability.
            </p>
          </div>
          <Button onClick={() => setShowAddService(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Services to Compare
          </Button>
        </div>

        {showAddService && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Available Services</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddService(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {availableServices.slice(0, 10).map(service => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => addService(service)}
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium truncate">{service.name}</h5>
                      <p className="text-sm text-muted-foreground truncate">
                        {service.category} • {service.clinic}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Comparison Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Service Comparison</h2>
          <p className="text-sm text-muted-foreground">
            Comparing {selectedServices.length} of {maxComparisons} services
          </p>
        </div>
        <div className="flex gap-2">
          {selectedServices.length < maxComparisons && (
            <Button variant="outline" onClick={() => setShowAddService(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add More
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedServices([])}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid gap-4 p-4 bg-muted/50 border-b">
          <div></div> {/* Empty cell for comparison features column */}
          {selectedServices.map(service => (
            <Card key={service.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => removeService(service.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{service.category}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Comparison Rows */}
        <div className="divide-y">
          {/* Service Description */}
          <div className="grid gap-4 p-4">
            <div className="font-medium text-sm">Description</div>
            {selectedServices.map(service => (
              <div key={service.id} className="text-sm text-muted-foreground">
                {service.description}
              </div>
            ))}
          </div>

          {/* Clinic */}
          <div className="grid gap-4 p-4">
            <div className="font-medium text-sm">Clinic</div>
            {selectedServices.map(service => (
              <div key={service.id} className="flex items-center gap-2">
                <span className="text-sm">{service.clinic}</span>
                {service.rating && (
                  <Badge variant="outline" className="text-xs">
                    ⭐ {service.rating}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Duration */}
          <div className="grid gap-4 p-4">
            <div className="font-medium text-sm">Duration</div>
            {selectedServices.map(service => (
              <div key={service.id} className="text-sm">
                {service.duration || "Not specified"}
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="grid gap-4 p-4">
            <div className="font-medium text-sm">Price</div>
            {selectedServices.map(service => (
              <div key={service.id} className="text-sm font-medium">
                {service.price || "Contact for pricing"}
              </div>
            ))}
          </div>

          {/* Availability */}
          <div className="grid gap-4 p-4">
            <div className="font-medium text-sm">Availability</div>
            {selectedServices.map(service => (
              <div key={service.id} className="flex items-center gap-2">
                {service.available ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-sm">Available Now</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Contact for availability</span>
                )}
                {service.waitingTime && (
                  <Badge variant="outline" className="text-xs">
                    {service.waitingTime}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div className="grid gap-4 p-4">
            <div className="font-medium text-sm">Requirements</div>
            {selectedServices.map(service => (
              <div key={service.id}>
                {service.requirements && service.requirements.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {service.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground mt-2 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-muted-foreground">No specific requirements</span>
                )}
              </div>
            ))}
          </div>

          {/* Coverage */}
          <div className="grid gap-4 p-4">
            <div className="font-medium text-sm">Insurance Coverage</div>
            {selectedServices.map(service => (
              <div key={service.id}>
                {service.coverage && service.coverage.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {service.coverage.map((cov, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cov}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Check with provider</span>
                )}
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="grid gap-4 p-4 bg-muted/30">
            <div className="font-medium text-sm">Actions</div>
            {selectedServices.map(service => (
              <div key={service.id} className="space-y-2">
                {service.available && (
                  <Button className="w-full text-sm" size="sm">
                    Book Now
                  </Button>
                )}
                <Button variant="outline" className="w-full text-sm" size="sm">
                  Learn More
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-4 bg-background border rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Service to Compare</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddService(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-60px)] p-4">
              <div className="space-y-2">
                {availableServices.map(service => (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      addService(service)
                      setShowAddService(false)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {service.category} • {service.clinic}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}