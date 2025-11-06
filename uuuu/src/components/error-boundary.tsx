'use client'

import { ErrorBoundary } from 'react-error-boundary'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorFallbackProps {
  error: Error & {
    digest?: string
    cause?: unknown
  }
  resetErrorBoundary: () => void
  componentName?: string
  showDetails?: boolean
}

/**
 * Generic error fallback component
 */
export function GenericErrorFallback({ 
  error, 
  resetErrorBoundary, 
  componentName = 'Component',
  showDetails = process.env.NODE_ENV === 'development' 
}: ErrorFallbackProps) {
  const router = useRouter()

  return (
    <Card className="m-4 max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-red-700">
          {componentName} Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">
          Something went wrong with the {componentName.toLowerCase()}.
        </p>
        
        {showDetails && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Error Details</span>
            </div>
            <code className="text-xs text-gray-600 break-all">
              {error.message}
            </code>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-1">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button onClick={resetErrorBoundary} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => router.push('/')} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading state component
 */
export function LoadingFallback({ 
  message = 'Loading...',
  componentName = 'Content'
}: { 
  message?: string
  componentName?: string 
}) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <p className="text-sm text-gray-600">
              {componentName} is loading...
            </p>
            <p className="text-xs text-gray-500">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Empty state component
 */
export function EmptyState({
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  action,
  icon: Icon = AlertTriangle
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="m-4">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Icon className="h-12 w-12 text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Network error component
 */
export function NetworkErrorFallback({ 
  error: _error, 
  resetErrorBoundary 
}: {
  error: Error & { digest?: string }
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="m-4 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-orange-500" />
        </div>
        <CardTitle className="text-orange-700">
          Connection Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">
          We couldn't connect to the server. Please check your internet connection and try again.
        </p>
        
        <div className="flex gap-2 justify-center">
          <Button onClick={resetErrorBoundary} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Form error component for displaying form validation errors
 */
export function FormError({ 
  error, 
  field 
}: { 
  error?: string | string[]
  field?: string 
}) {
  if (!error) return null

  const errorMessage = Array.isArray(error) ? error.join(', ') : error

  return (
    <p className="text-sm text-red-600 mt-1">
      {field && <span className="font-medium">{field}: </span>}
      {errorMessage}
    </p>
  )
}

/**
 * Auth error component
 */
export function AuthErrorFallback({ 
  error: _error, 
  resetErrorBoundary 
}: {
  error: Error & { digest?: string }
  resetErrorBoundary: () => void
}) {
  const router = useRouter()

  return (
    <Card className="m-4 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-red-700">
          Authentication Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">
          You need to be logged in to access this page. Please sign in and try again.
        </p>
        
        <div className="flex gap-2 justify-center">
          <Button onClick={() => router.push('/auth/signin' as any)} variant="default">
            Sign In
          </Button>
          <Button onClick={resetErrorBoundary} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Permission error component
 */
export function PermissionErrorFallback({ 
  requiredPermission 
}: {
  requiredPermission: string
}) {
  return (
    <Card className="m-4 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-red-700">
          Access Denied
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">
          You don't have permission to access this resource. 
          {requiredPermission && (
            <span className="block mt-1 text-sm">
              Required permission: <code className="bg-gray-100 px-1 rounded">{requiredPermission}</code>
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Export the main ErrorBoundary component
 */
export { ErrorBoundary }

export default GenericErrorFallback