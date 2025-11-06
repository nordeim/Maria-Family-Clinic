import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    { className, items, separator, showHome = true, ...props },
    ref
  ) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex items-center text-sm", className)}
        {...props}
      >
        <ol className="flex items-center space-x-2">
          {showHome && (
            <li>
              <a
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </a>
            </li>
          )}
          {items.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              {(index > 0 || showHome) && (
                <span className="text-muted-foreground" aria-hidden="true">
                  {separator || <ChevronRight className="h-4 w-4" />}
                </span>
              )}
              {item.href && !item.current ? (
                <a
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    item.current
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)
Breadcrumbs.displayName = "Breadcrumbs"

export { Breadcrumbs }
export type { BreadcrumbItem }
