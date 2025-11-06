import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  siblingCount?: number
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      showFirstLast = true,
      showPrevNext = true,
      siblingCount = 1,
      ...props
    },
    ref
  ) => {
    const range = (start: number, end: number) => {
      const length = end - start + 1
      return Array.from({ length }, (_, idx) => idx + start)
    }

    const paginationRange = React.useMemo(() => {
      const totalPageNumbers = siblingCount + 5

      if (totalPageNumbers >= totalPages) {
        return range(1, totalPages)
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

      const shouldShowLeftDots = leftSiblingIndex > 2
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2

      const firstPageIndex = 1
      const lastPageIndex = totalPages

      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount
        const leftRange = range(1, leftItemCount)
        return [...leftRange, "dots", totalPages]
      }

      if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount
        const rightRange = range(totalPages - rightItemCount + 1, totalPages)
        return [firstPageIndex, "dots", ...rightRange]
      }

      if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = range(leftSiblingIndex, rightSiblingIndex)
        return [firstPageIndex, "dots", ...middleRange, "dots", lastPageIndex]
      }

      return range(1, totalPages)
    }, [currentPage, totalPages, siblingCount])

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center space-x-2", className)}
        {...props}
      >
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
        )}
        {showPrevNext && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === "dots") {
            return (
              <span
                key={`dots-${index}`}
                className="flex h-9 w-9 items-center justify-center"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )
          }

          return (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber as number)}
              className="min-w-[2.25rem]"
            >
              {pageNumber}
            </Button>
          )
        })}
        {showPrevNext && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        )}
      </div>
    )
  }
)
Pagination.displayName = "Pagination"

export { Pagination }
