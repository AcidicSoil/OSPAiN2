import React from 'react';
import { getErrorMessage, ErrorDisplayOptions, AppError } from '../../utils/errorHandling';

interface ErrorDisplayProps extends ErrorDisplayOptions {
  error: Error | AppError | unknown;
  className?: string;
  onDismiss?: () => void;
  variant?: 'inline' | 'toast' | 'card' | 'page';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  className = '',
  onDismiss,
  variant = 'inline',
  showDetails = process.env.NODE_ENV === 'development',
  showStack = process.env.NODE_ENV === 'development',
  actionText,
  actionFn
}) => {
  const { title, message, details } = getErrorMessage(error, {
    showDetails,
    showStack,
    actionText,
    actionFn
  });

  // If error is null or undefined, don't render anything
  if (!error) return null;

  // Define base classes for each variant
  const variantClasses = {
    inline: 'p-2 rounded-md text-sm border-l-4 border-error bg-error bg-opacity-10',
    toast: 'p-3 shadow-lg rounded-lg mb-2 border-l-4 border-error bg-surface',
    card: 'p-4 shadow-md rounded-lg border border-border bg-surface',
    page: 'p-6 rounded-lg border border-border bg-surface shadow-xl mx-auto max-w-2xl text-center'
  };

  return (
    <div className={`error-display ${variantClasses[variant]} ${className}`} role="alert" aria-live="assertive">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-error mb-1">{title}</h4>
          <p className="text-text-primary mb-2">{message}</p>
          
          {showDetails && details && (
            <details className="mt-2 text-text-secondary">
              <summary className="cursor-pointer text-sm font-medium">Show details</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs p-2 bg-carbon-50 dark:bg-carbon-900 rounded overflow-auto max-h-32">
                {JSON.stringify(details, null, 2)}
              </pre>
            </details>
          )}
          
          {/* Action button */}
          {actionText && actionFn && (
            <button 
              onClick={actionFn}
              className="mt-3 px-4 py-1.5 text-sm font-medium bg-primary text-white rounded hover:bg-primary-hover transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>
        
        {/* Dismiss button for toast and card variants */}
        {onDismiss && (variant === 'toast' || variant === 'card') && (
          <button 
            onClick={onDismiss}
            className="ml-2 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
      }
      
      // Default fallback UI
      return (
        <div className="p-6 rounded-lg border border-border bg-surface shadow-xl mx-auto max-w-2xl text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-text-primary">Something went wrong</h2>
          <p className="mt-2 text-text-secondary">{this.state.error.message}</p>
          <button
            onClick={this.resetErrorBoundary}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorDisplay; 