import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { apiLogger } from '../../utils/apiUtils';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child component tree
 * and display a fallback UI instead of crashing the whole application.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging service
    apiLogger.error('React component error caught by ErrorBoundary', error, {
      startTime: Date.now(),
      endTime: Date.now(),
      retryCount: 0,
      url: window.location.href,
      method: 'React Component'
    });

    // Set the detailed error info in state
    this.setState({
      errorInfo
    });

    // Display a toast notification
    toast.error(`An error occurred: ${error.message}`, {
      position: 'top-right',
      autoClose: 5000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, render a default error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>We've encountered an error and are working to fix it.</p>
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()}
                className="error-reload-btn"
              >
                Reload Page
              </button>
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="error-try-again-btn"
              >
                Try Again
              </button>
            </div>
            
            {/* In development mode, show the error details */}
            {process.env.NODE_ENV === 'development' && (
              <div className="error-details">
                <h3>Error Details:</h3>
                <p className="error-message">{this.state.error?.toString()}</p>
                <div className="error-stack">
                  <pre>{this.state.error?.stack}</pre>
                </div>
                {this.state.errorInfo && (
                  <div className="component-stack">
                    <h4>Component Stack:</h4>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 