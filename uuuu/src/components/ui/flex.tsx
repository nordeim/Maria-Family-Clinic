import * as React from "react"
import { cn } from "@/lib/utils"

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col" | "row-reverse" | "col-reverse"
  wrap?: "wrap" | "nowrap" | "wrap-reverse"
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  align?: "start" | "center" | "end" | "stretch" | "baseline"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = "row",
      wrap = "nowrap",
      gap = "md",
      align,
      justify,
      ...props
    },
    ref
  ) => {
    const directionClasses = {
      row: "flex-row",
      col: "flex-col",
      "row-reverse": "flex-row-reverse",
      "col-reverse": "flex-col-reverse",
    }

    const wrapClasses = {
      wrap: "flex-wrap",
      nowrap: "flex-nowrap",
      "wrap-reverse": "flex-wrap-reverse",
    }

    const gapClasses = {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    }

    const alignClasses = align
      ? {
          start: "items-start",
          center: "items-center",
          end: "items-end",
          stretch: "items-stretch",
          baseline: "items-baseline",
        }[align]
      : ""

    const justifyClasses = justify
      ? {
          start: "justify-start",
          center: "justify-center",
          end: "justify-end",
          between: "justify-between",
          around: "justify-around",
          evenly: "justify-evenly",
        }[justify]
      : ""

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionClasses[direction],
          wrapClasses[wrap],
          gapClasses[gap],
          alignClasses,
          justifyClasses,
          className
        )}
        {...props}
      />
    )
  }
)
Flex.displayName = "Flex"

export { Flex }
