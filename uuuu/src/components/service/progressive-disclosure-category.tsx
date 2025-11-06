"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronRight, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MedicalCategory {
  id: string
  name: string
  description: string
  complexityLevel: "basic" | "intermediate" | "advanced" | "expert"
  subcategories?: MedicalCategory[]
  services?: ServiceInfo[]
  requirements?: string[]
  commonConditions?: string[]
  warningFlags?: string[]
  relatedSpecialties?: string[]
}

interface ServiceInfo {
  id: string
  name: string
  description: string
  category: string
  complexity?: "routine" | "moderate" | "complex" | "emergency"
  prerequisites?: string[]
  estimatedTime?: string
  costRange?: string
  successRate?: string
  risks?: string[]
  alternatives?: string[]
}

interface ProgressiveDisclosureProps {
  category: MedicalCategory
  onServiceSelect: (service: ServiceInfo) => void
  onPrerequisiteCheck?: (requirements: string[]) => void
  userProfile?: {
    age?: number
    medicalHistory?: string[]
    currentConditions?: string[]
    previousTreatments?: string[]
  }
}

const complexityColors = {
  basic: "bg-green-50 text-green-700 border-green-200",
  intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
  advanced: "bg-orange-50 text-orange-700 border-orange-200",
  expert: "bg-red-50 text-red-700 border-red-200"
}

const serviceComplexityColors = {
  routine: "bg-green-50 text-green-600",
  moderate: "bg-yellow-50 text-yellow-600",
  complex: "bg-orange-50 text-orange-600",
  emergency: "bg-red-50 text-red-600"
}

export function ProgressiveDisclosureCategory({
  category,
  onServiceSelect,
  onPrerequisiteCheck,
  userProfile
}: ProgressiveDisclosureProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["overview"])
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const checkPrerequisites = (service: ServiceInfo) => {
    if (service.prerequisites && onPrerequisiteCheck) {
      onPrerequisiteCheck(service.prerequisites)
    }
    setSelectedService(service)
  }

  const assessUserEligibility = (category: MedicalCategory) => {
    if (!userProfile) return null

    const eligibility = {
      eligible: true,
      warnings: [] as string[],
      recommendations: [] as string[]
    }

    // Age-based assessments
    if (userProfile.age) {
      if (category.complexityLevel === "expert" && userProfile.age > 75) {
        eligibility.warnings.push("Advanced age may increase procedure complexity")
        eligibility.recommendations.push("Consider consultation with geriatric specialist")
      }
      if (category.id === "pediatrics" && userProfile.age > 18) {
        eligibility.warnings.push("This specialty is designed for patients under 18")
        eligibility.recommendations.push("Consider general practice or internal medicine")
      }
    }

    // Medical history checks
    if (userProfile.medicalHistory?.includes("diabetes") && category.complexityLevel === "advanced") {
      eligibility.warnings.push("Diabetes may complicate procedures in this specialty")
      eligibility.recommendations.push("Ensure proper diabetes management before procedures")
    }

    return eligibility
  }

  const eligibility = assessUserEligibility(category)

  const renderServiceDetails = (service: ServiceInfo) => (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <Badge className={serviceComplexityColors[service.complexity || "routine"]}>
            {service.complexity || "routine"}
          </Badge>
        </div>
        <p className="text-muted-foreground">{service.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {service.estimatedTime && (
            <div>
              <span className="font-medium">Duration:</span> {service.estimatedTime}
            </div>
          )}
          {service.costRange && (
            <div>
              <span className="font-medium">Cost Range:</span> {service.costRange}
            </div>
          )}
          {service.successRate && (
            <div>
              <span className="font-medium">Success Rate:</span> {service.successRate}
            </div>
          )}
          <div>
            <span className="font-medium">Category:</span> {service.category}
          </div>
        </div>

        {/* Prerequisites */}
        {service.prerequisites && service.prerequisites.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Prerequisites:</h4>
            <ul className="space-y-1">
              {service.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {service.risks && service.risks.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Potential Risks:</strong> {service.risks.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Alternatives */}
        {service.alternatives && service.alternatives.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Alternative Treatments:</h4>
            <ul className="space-y-1">
              {service.alternatives.map((alt, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  {alt}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={() => onServiceSelect(service)} className="w-full">
          Select This Service
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{category.name}</CardTitle>
                <Badge className={complexityColors[category.complexityLevel]}>
                  {category.complexityLevel}
                </Badge>
              </div>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          </div>
        </CardHeader>

        {/* User Eligibility Warning */}
        {eligibility && eligibility.warnings.length > 0 && (
          <CardContent className="pt-0">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <strong>Important:</strong> {eligibility.warnings.join(" ")}
                {eligibility.recommendations.length > 0 && (
                  <div className="mt-2">
                    <strong>Recommendations:</strong> {eligibility.recommendations.join(" ")}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Progressive Disclosure Sections */}
      <div className="space-y-4">
        {/* Overview Section */}
        <Collapsible open={expandedSections.includes("overview")}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-4"
              onClick={() => toggleSection("overview")}
            >
              <span className="font-medium">Overview & Common Conditions</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                expandedSections.includes("overview") && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="p-4 space-y-4">
                {category.commonConditions && (
                  <div>
                    <h4 className="font-medium mb-2">Common Conditions Treated:</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.commonConditions.map((condition, index) => (
                        <Badge key={index} variant="outline">{condition}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {category.relatedSpecialties && (
                  <div>
                    <h4 className="font-medium mb-2">Related Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.relatedSpecialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Services Section */}
        {category.services && (
          <Collapsible open={expandedSections.includes("services")}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-4"
                onClick={() => toggleSection("services")}
              >
                <span className="font-medium">Available Services ({category.services.length})</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  expandedSections.includes("services") && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3">
                {category.services.map(service => (
                  <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{service.name}</h4>
                            <Badge className={serviceComplexityColors[service.complexity || "routine"]}>
                              {service.complexity || "routine"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {service.estimatedTime && <span>⏱️ {service.estimatedTime}</span>}
                            {service.costRange && <span>💰 {service.costRange}</span>}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkPrerequisites(service)}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Subcategories Section */}
        {category.subcategories && (
          <Collapsible open={expandedSections.includes("subcategories")}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-4"
                onClick={() => toggleSection("subcategories")}
              >
                <span className="font-medium">Subcategories ({category.subcategories.length})</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  expandedSections.includes("subcategories") && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3">
                {category.subcategories.map(subcategory => (
                  <div key={subcategory.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{subcategory.name}</h4>
                      <Badge className={complexityColors[subcategory.complexityLevel]}>
                        {subcategory.complexityLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {subcategory.description}
                    </p>
                    {subcategory.services && (
                      <div className="text-sm">
                        <strong>{subcategory.services.length} services available</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Requirements Section */}
        {category.requirements && (
          <Collapsible open={expandedSections.includes("requirements")}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-4"
                onClick={() => toggleSection("requirements")}
              >
                <span className="font-medium">Requirements & Preparation</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  expandedSections.includes("requirements") && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {category.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                        <span className="text-sm">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Selected Service Details */}
      {selectedService && renderServiceDetails(selectedService)}
    </div>
  )
}