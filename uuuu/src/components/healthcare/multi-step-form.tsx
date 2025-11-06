import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Step {
  id: string
  title: string
  description?: string
}

interface MultiStepFormProps {
  steps: Step[]
  currentStep: number
  onStepChange?: (step: number) => void
  children: React.ReactNode
  onSubmit?: () => void
  onBack?: () => void
  isLastStep?: boolean
  isFirstStep?: boolean
  className?: string
}

const MultiStepForm = React.forwardRef<HTMLDivElement, MultiStepFormProps>(
  (
    {
      steps,
      currentStep,
      onStepChange,
      children,
      onSubmit,
      onBack,
      isLastStep = false,
      isFirstStep = true,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("w-full", className)}>
        {/* Steps indicator */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isComplete = stepNumber < currentStep
              const isCurrent = stepNumber === currentStep

              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex flex-1 flex-col items-center",
                    index !== 0 && "ml-2"
                  )}
                >
                  <div className="flex w-full items-center">
                    {index !== 0 && (
                      <div
                        className={cn(
                          "h-0.5 w-full transition-colors",
                          isComplete ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onStepChange?.(stepNumber)}
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isComplete &&
                          "border-primary bg-primary text-primary-foreground",
                        isCurrent &&
                          "border-primary bg-background text-primary",
                        !isComplete &&
                          !isCurrent &&
                          "border-muted bg-background text-muted-foreground"
                      )}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{stepNumber}</span>
                      )}
                    </button>
                    {index !== steps.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 w-full transition-colors",
                          stepNumber < currentStep ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Form content */}
        <div className="mb-6">{children}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep}
          >
            Back
          </Button>
          <Button
            type={isLastStep ? "submit" : "button"}
            onClick={isLastStep ? onSubmit : undefined}
          >
            {isLastStep ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    )
  }
)
MultiStepForm.displayName = "MultiStepForm"

export { MultiStepForm }
export type { Step }
