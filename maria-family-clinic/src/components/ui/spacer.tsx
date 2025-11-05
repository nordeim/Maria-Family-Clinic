import * as React from "react"
import { cn } from "@/lib/utils"

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-2",
      md: "h-4",
      lg: "h-6",
      xl: "h-8",
      "2xl": "h-12",
    }

    return (
      <div
        ref={ref}
        className={cn(sizeClasses[size], className)}
        aria-hidden="true"
        {...props}
      />
    )
  }
)
Spacer.displayName = "Spacer"

export { Spacer }
