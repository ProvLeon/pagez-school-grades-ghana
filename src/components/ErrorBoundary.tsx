import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (if configured)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Here you would typically send to your error monitoring service
      // Example: Sentry, LogRocket, etc.

      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: localStorage.getItem('userId') || 'anonymous',
      };

      // For development, log to console
      if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
        console.error('Error Report:', errorData);
      }

      // In production, you would send this to your monitoring service
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });

    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }

    if (message.includes('chunk') || message.includes('loading')) {
      return 'low';
    }

    if (message.includes('auth') || message.includes('permission')) {
      return 'high';
    }

    return 'critical';
  };

  private getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();

    if (message.includes('chunk')) {
      return 'Failed to load application resources. This may be due to a network issue or an application update.';
    }

    if (message.includes('network')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }

    if (message.includes('auth')) {
      return 'Authentication error. Please log in again to continue.';
    }

    return 'An unexpected error occurred. Our team has been notified and is working to fix this issue.';
  };

  private getSuggestions = (error: Error): string[] => {
    const message = error.message.toLowerCase();
    const suggestions: string[] = [];

    if (message.includes('network')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try refreshing the page');
      suggestions.push('Contact your IT support if the issue persists');
    } else if (message.includes('chunk') || message.includes('loading')) {
      suggestions.push('Refresh the page to reload resources');
      suggestions.push('Clear your browser cache');
      suggestions.push('Try using a different browser');
    } else if (message.includes('auth')) {
      suggestions.push('Log out and log back in');
      suggestions.push('Contact your administrator for access issues');
    } else {
      suggestions.push('Try refreshing the page');
      suggestions.push('Go back to the dashboard');
      suggestions.push('Contact support if the problem continues');
    }

    return suggestions;
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const severity = error ? this.getErrorSeverity(error) : 'critical';
      const errorMessage = error ? this.getErrorMessage(error) : 'An unknown error occurred';
      const suggestions = error ? this.getSuggestions(error) : [];
      const canRetry = this.retryCount < this.maxRetries;

      const severityColors = {
        low: 'border-yellow-200 bg-yellow-50',
        medium: 'border-orange-200 bg-orange-50',
        high: 'border-red-200 bg-red-50',
        critical: 'border-red-300 bg-red-100',
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Oops! Something went wrong
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Severity Alert */}
              <Alert className={severityColors[severity]}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {errorMessage}
                </AlertDescription>
              </Alert>

              {/* Error Details (Development Only) */}
              {import.meta.env.VITE_APP_ENVIRONMENT === 'development' && error && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Development Error Details:
                  </h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Error:</span>
                      <p className="text-red-600 dark:text-red-400 font-mono text-xs mt-1">
                        {error.message}
                      </p>
                    </div>
                    {error.stack && (
                      <div>
                        <span className="font-medium">Stack Trace:</span>
                        <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Error ID:</span>
                      <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded ml-2">
                        {this.state.errorId}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    Suggested Actions:
                  </h4>
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start text-blue-800 dark:text-blue-200">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </Button>
                )}

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              {/* Contact Support */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  If this problem persists, please contact support
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const subject = `Error Report - ${this.state.errorId}`;
                    const body = `Error ID: ${this.state.errorId}\nError Message: ${error?.message}\nTimestamp: ${new Date().toISOString()}\nPage: ${window.location.href}`;
                    window.location.href = `mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'support@pbpagez.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                PB Pagez v{import.meta.env.VITE_APP_VERSION || '1.0.0'} |
                Error ID: {this.state.errorId}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Handled error:', error, errorInfo);

    // You can implement additional error handling logic here
    // such as sending to error monitoring service
  };

  return { handleError };
};
