import * as React from "react"
import { Clock, DollarSign, Calendar, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Service {
  id: string
  name: string
  description: string
  category: string
  duration?: string
  price?: string
  available?: boolean
  popular?: boolean
  requirements?: string[]
}

interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  service: Service
  onBookService?: (serviceId: string) => void
  onLearnMore?: (serviceId: string) => void
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  (
    { service, onBookService, onLearnMore, className, ...props },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group relative transition-all hover:shadow-md",
          className
        )}
        {...props}
      >
        {service.popular && (
          <div className="absolute -right-2 -top-2 z-10">
            <Badge className="bg-primary text-primary-foreground shadow-md">
              Popular
            </Badge>
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2">
                <Badge variant="outline">{service.category}</Badge>
              </div>
              <CardTitle className="text-xl">{service.name}</CardTitle>
              <CardDescription className="mt-2 line-clamp-2">
                {service.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Service Details */}
          <div className="grid gap-2 text-sm">
            {service.duration && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{service.duration}</span>
              </div>
            )}
            {service.price && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {service.price}
                </span>
              </div>
            )}
          </div>

          {/* Requirements */}
          {service.requirements && service.requirements.length > 0 && (
            <div className="space-y-1.5 rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Requirements:
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {service.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Availability Status */}
          <div className="flex items-center justify-between">
            <Badge
              variant={service.available ? "success" : "secondary"}
              className={cn(
                service.available && "bg-success/10 text-success border-success/20"
              )}
            >
              {service.available ? "Available Now" : "Contact for Availability"}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {service.available && (
              <Button
                className="flex-1"
                onClick={() => onBookService?.(service.id)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            )}
            {onLearnMore && (
              <Button
                variant="outline"
                className={cn(!service.available && "flex-1")}
                onClick={() => onLearnMore(service.id)}
              >
                Learn More
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
ServiceCard.displayName = "ServiceCard"

export { ServiceCard }
export type { Service }
