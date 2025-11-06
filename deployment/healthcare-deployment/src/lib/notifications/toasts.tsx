'use client'

import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Toast notification system for user feedback
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
}

/**
 * Custom toast component with better UX
 */
function ToastComponent({
  type,
  title,
  description,
  action,
  onDismiss,
  duration,
}: {
  type: ToastType
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  onDismiss: () => void
  duration?: number
}) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }

  const Icon = icons[type]

  return (
    <Card className={`${colors[type]} border shadow-lg max-w-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${iconColors[type]} mt-0.5 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{title}</h4>
            {description && (
              <p className="text-sm opacity-90 mt-1 break-words">{description}</p>
            )}
            {action && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-sm font-medium underline-offset-4 hover:underline mt-2"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Success toast
 */
export function showSuccess(
  title: string,
  options: ToastOptions = {}
) {
  const { description, action, duration = 4000 } = options
  
  toast.custom((t) => (
    <ToastComponent
      type="success"
      title={title}
      description={description}
      action={action}
      onDismiss={() => toast.dismiss(t)}
      duration={duration}
    />
  ), {
    duration,
  })
}

/**
 * Error toast
 */
export function showError(
  title: string,
  options: ToastOptions = {}
) {
  const { description, action, duration = 6000 } = options
  
  toast.custom((t) => (
    <ToastComponent
      type="error"
      title={title}
      description={description}
      action={action}
      onDismiss={() => toast.dismiss(t)}
      duration={duration}
    />
  ), {
    duration,
  })
}

/**
 * Warning toast
 */
export function showWarning(
  title: string,
  options: ToastOptions = {}
) {
  const { description, action, duration = 5000 } = options
  
  toast.custom((t) => (
    <ToastComponent
      type="warning"
      title={title}
      description={description}
      action={action}
      onDismiss={() => toast.dismiss(t)}
      duration={duration}
    />
  ), {
    duration,
  })
}

/**
 * Info toast
 */
export function showInfo(
  title: string,
  options: ToastOptions = {}
) {
  const { description, action, duration = 4000 } = options
  
  toast.custom((t) => (
    <ToastComponent
      type="info"
      title={title}
      description={description}
      action={action}
      onDismiss={() => toast.dismiss(t)}
      duration={duration}
    />
  ), {
    duration,
  })
}

/**
 * Validation error toast
 */
export function showValidationError(field: string, message: string) {
  showError('Validation Error', {
    description: `${field}: ${message}`,
    duration: 5000,
  })
}

/**
 * Network error toast
 */
export function showNetworkError() {
  showError('Network Error', {
    description: 'Please check your internet connection and try again.',
    action: {
      label: 'Retry',
      onClick: () => window.location.reload(),
    },
    duration: 8000,
  })
}

/**
 * Auth error toast
 */
export function showAuthError() {
  showError('Authentication Error', {
    description: 'Please sign in to continue.',
    action: {
      label: 'Sign In',
      onClick: () => window.location.href = '/auth/signin',
    },
    duration: 8000,
  })
}

/**
 * Permission error toast
 */
export function showPermissionError() {
  showError('Access Denied', {
    description: 'You don\'t have permission to perform this action.',
    duration: 6000,
  })
}

/**
 * Server error toast
 */
export function showServerError(error?: string) {
  showError('Server Error', {
    description: error || 'Something went wrong on our end. Please try again later.',
    action: {
      label: 'Retry',
      onClick: () => window.location.reload(),
    },
    duration: 8000,
  })
}

/**
 * Appointment-specific toasts
 */
export function showAppointmentBooked() {
  showSuccess('Appointment Booked', {
    description: 'Your appointment has been successfully scheduled. You will receive a confirmation email shortly.',
    action: {
      label: 'View My Appointments',
      onClick: () => window.location.href = '/appointments',
    },
  })
}

export function showAppointmentCancelled() {
  showSuccess('Appointment Cancelled', {
    description: 'Your appointment has been cancelled successfully.',
  })
}

export function showAppointmentUpdated() {
  showSuccess('Appointment Updated', {
    description: 'Your appointment details have been updated successfully.',
  })
}

/**
 * Profile-specific toasts
 */
export function showProfileUpdated() {
  showSuccess('Profile Updated', {
    description: 'Your profile has been updated successfully.',
  })
}

export function showProfileCreated() {
  showSuccess('Profile Created', {
    description: 'Your profile has been created successfully.',
  })
}

/**
 * Healthier SG-specific toasts
 */
export function showHealthierSgEnrolled() {
  showSuccess('Successfully Enrolled!', {
    description: 'Welcome to Healthier SG! You will receive confirmation from your clinic within 2-3 business days.',
    action: {
      label: 'View Program Details',
      onClick: () => window.location.href = '/healthier-sg',
    },
  })
}

export function showHealthierSgEnrolledError() {
  showError('Enrollment Failed', {
    description: 'There was an issue with your Healthier SG enrollment. Please try again or contact support.',
    action: {
      label: 'Contact Support',
      onClick: () => window.location.href = '/contact',
    },
  })
}

/**
 * Form-specific toasts
 */
export function showFormError(errors: Record<string, string[]>) {
  const errorMessages = Object.entries(errors).map(([field, messages]) => 
    `${field}: ${messages.join(', ')}`
  ).join('\n')
  
  showError('Form Validation Failed', {
    description: errorMessages,
    duration: 8000,
  })
}

/**
 * Generic error handler for API responses
 */
export function handleApiError(error: any) {
  if (error?.data?.code === 'UNAUTHORIZED') {
    showAuthError()
  } else if (error?.data?.code === 'FORBIDDEN') {
    showPermissionError()
  } else if (error?.data?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
    showNetworkError()
  } else if (error?.data?.code === 'VALIDATION_ERROR') {
    if (error.data.issues?.length > 0) {
      const validationErrors = error.data.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
      showFormError({ form: validationErrors })
    }
  } else {
    showServerError(error?.data?.message || error?.message)
  }
}

/**
 * Optimistic update success toast
 */
export function showOptimisticUpdateSuccess(originalAction: string) {
  showSuccess(`${originalAction} Saved`, {
    description: 'Changes have been saved locally and will sync when connection is restored.',
  })
}

/**
 * Bulk action toast
 */
export function showBulkActionResult(
  action: string,
  successCount: number,
  errorCount: number,
  errorDetails?: string[]
) {
  if (errorCount === 0) {
    showSuccess(`${action} Completed`, {
      description: `${successCount} items were successfully ${action.toLowerCase()}d.`,
    })
  } else if (successCount === 0) {
    showError(`${action} Failed`, {
      description: `All ${errorCount} items failed to ${action.toLowerCase()}.`,
      duration: 10000,
    })
  } else {
    showWarning(`${action} Partially Completed`, {
      description: `${successCount} items succeeded, ${errorCount} failed.`,
      duration: 10000,
      action: errorDetails?.length ? {
        label: 'View Details',
        onClick: () => console.log('Error details:', errorDetails),
      } : undefined,
    })
  }
}