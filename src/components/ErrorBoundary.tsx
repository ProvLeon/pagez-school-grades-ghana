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
        low: 'border-yellow-200/50 bg-yellow-50/50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
        medium: 'border-orange-200/50 bg-orange-50/50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200',
        high: 'border-red-200/50 bg-red-50/50 dark:bg-red-900/20 text-red-800 dark:text-red-200',
        critical: 'border-red-300/50 bg-red-100/50 dark:bg-red-950/30 text-red-900 dark:text-red-100',
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Ambient background glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <Card className="w-full max-w-2xl rounded-2xl bg-white dark:bg-card shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border relative z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-orange-400 to-red-500" />
            
            <CardHeader className="text-center pb-2 pt-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-4 bg-red-100 dark:bg-red-900/20 rounded-full blur-xl animate-pulse" />
                  <div className="w-20 h-20 bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-950/30 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 dark:border-red-900/30 relative">
                    <AlertTriangle className="w-10 h-10 text-red-500 drop-shadow-sm" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Something unexpected happened
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg max-w-md mx-auto">
                We're sorry for the interruption. Our system encountered a problem while processing your request.
              </p>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-10">
              {/* Error Severity Alert */}
              <Alert className={`mt-4 border shadow-sm ${severityColors[severity]} backdrop-blur-sm`}>
                <AlertDescription className="font-medium flex items-center justify-center text-center py-1">
                  {errorMessage}
                </AlertDescription>
              </Alert>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wider">
                    Recommended Actions
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-center text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-50 dark:border-gray-700/50">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Error Details (Development Only) */}
              {import.meta.env.VITE_APP_ENVIRONMENT === 'development' && error && (
                <div className="bg-gray-900 rounded-xl p-5 text-left overflow-hidden border border-gray-800 shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Developer Logs
                    </h4>
                    <code className="text-xs text-gray-500 font-mono">ID: {this.state.errorId}</code>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-red-400 font-mono text-sm break-all">
                        {error.message}
                      </p>
                    </div>
                    {error.stack && (
                      <div className="relative group">
                        <pre className="text-xs text-gray-400 font-mono bg-black/50 p-3 rounded-lg overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] text-base"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm text-base"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.2)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.25)] transition-all duration-300 hover:-translate-y-1 border-0 text-base font-medium"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const subject = `Error Report - ${this.state.errorId}`;
                    const body = `Error ID: ${this.state.errorId}\nError Message: ${error?.message}\nTimestamp: ${new Date().toISOString()}\nPage: ${window.location.href}`;
                    window.location.href = `mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'support@pbpagez.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Report this issue
                </Button>
                <div className="text-xs text-gray-400 mt-4 sm:mt-0 font-medium tracking-wide">
                  eResultsGH • Ref: {this.state.errorId.split('_')[1] || this.state.errorId}
                </div>
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
