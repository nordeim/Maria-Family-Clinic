import * as React from "react"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

interface TimeSlotsProps {
  date: Date
  slots: TimeSlot[]
  selectedSlot?: string
  onSlotSelect: (slotId: string) => void
  className?: string
}

const TimeSlots = React.forwardRef<HTMLDivElement, TimeSlotsProps>(
  ({ date, slots, selectedSlot, onSlotSelect, className }, ref) => {
    return (
      <Card ref={ref} className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Available Time Slots
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {slots.map((slot) => (
              <Button
                key={slot.id}
                variant={selectedSlot === slot.id ? "default" : "outline"}
                className={cn(
                  "h-auto flex-col gap-1 py-3",
                  !slot.available && "cursor-not-allowed opacity-50"
                )}
                disabled={!slot.available}
                onClick={() => slot.available && onSlotSelect(slot.id)}
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{slot.time}</span>
              </Button>
            ))}
          </div>
          {slots.every((slot) => !slot.available) && (
            <div className="mt-4 rounded-md bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No available slots for this date. Please select another date.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
TimeSlots.displayName = "TimeSlots"

export { TimeSlots }
export type { TimeSlot }
