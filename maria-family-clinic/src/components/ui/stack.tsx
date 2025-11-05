import * as React from "react"
import { cn } from "@/lib/utils"

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around"
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = "vertical",
      spacing = "md",
      align = "stretch",
      justify = "start",
      ...props
    },
    ref
  ) => {
    const directionClasses = {
      vertical: "flex-col",
      horizontal: "flex-row",
    }

    const spacingClasses = {
      vertical: {
        none: "space-y-0",
        sm: "space-y-2",
        md: "space-y-4",
        lg: "space-y-6",
        xl: "space-y-8",
      },
      horizontal: {
        none: "space-x-0",
        sm: "space-x-2",
        md: "space-x-4",
        lg: "space-x-6",
        xl: "space-x-8",
      },
    }

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    }

    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionClasses[direction],
          spacingClasses[direction][spacing],
          alignClasses[align],
          justifyClasses[justify],
          className
        )}
        {...props}
      />
    )
  }
)
Stack.displayName = "Stack"

export { Stack }
