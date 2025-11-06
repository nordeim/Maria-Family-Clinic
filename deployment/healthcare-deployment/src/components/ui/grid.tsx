import * as React from "react"
import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: "none" | "sm" | "md" | "lg" | "xl"
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = "md", ...props }, ref) => {
    const colsClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-12",
    }

    const gapClasses = {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    }

    return (
      <div
        ref={ref}
        className={cn("grid", colsClasses[cols], gapClasses[gap], className)}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, cols = 1, ...props }, ref) => {
    const colsClasses = {
      1: "col-span-1",
      2: "col-span-1 sm:col-span-2",
      3: "col-span-1 sm:col-span-2 lg:col-span-3",
      4: "col-span-1 sm:col-span-2 lg:col-span-4",
      6: "col-span-2 sm:col-span-3 lg:col-span-6",
      12: "col-span-12",
    }

    return (
      <div
        ref={ref}
        className={cn(colsClasses[cols], className)}
        {...props}
      />
    )
  }
)
GridItem.displayName = "GridItem"

export { Grid, GridItem }
