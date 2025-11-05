import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, FileX } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Form Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorReportingService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FileX className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-red-800">
              Oops! Something went wrong
            </CardTitle>
            <CardDescription className="text-red-700">
              We encountered an error while processing the form. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-white border border-red-200 rounded text-sm">
                <summary className="cursor-pointer font-medium text-red-800 mb-2">
                  Error Details (Development)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="text-xs text-red-700 mt-1 overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="text-xs text-red-700 mt-1 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="text-center text-sm text-red-700">
              <p>If the problem persists, please contact our support team.</p>
              <p className="mt-1">
                Email: <a href="mailto:support@myfamilyclinic.sg" className="underline">
                  support@myfamilyclinic.sg
                </a> | Phone: +65 6123 4567
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Simplified hook-based error boundary
export function useFormErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error('Form error:', error, context);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const reset = React.useCallback(() => {
    setError(null);
    // You might want to add more reset logic here
  }, []);

  return {
    error,
    handleError,
    clearError,
    reset,
    hasError: error !== null,
  };
}

// Error fallback component
interface FormErrorFallbackProps {
  error: Error;
  onReset: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
}

export function FormErrorFallback({ 
  error, 
  onReset, 
  onGoHome,
  showDetails = false 
}: FormErrorFallbackProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-red-800">
          Form Error
        </CardTitle>
        <CardDescription className="text-red-700">
          {error.message || 'An unexpected error occurred'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onReset}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          {onGoHome && (
            <Button
              variant="outline"
              onClick={onGoHome}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>

        {showDetails && (
          <details className="mt-4 p-3 bg-white border border-red-200 rounded text-sm">
            <summary className="cursor-pointer font-medium mb-2">
              Technical Details
            </summary>
            <pre className="text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// Higher-order component for form components
export function withFormErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorHandler?: (error: Error) => void
) {
  const WrappedComponent = (props: P) => (
    <FormErrorBoundary onError={(error) => errorHandler?.(error)}>
      <Component {...props} />
    </FormErrorBoundary>
  );

  WrappedComponent.displayName = `withFormErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}