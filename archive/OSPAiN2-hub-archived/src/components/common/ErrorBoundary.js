"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_toastify_1 = require("react-toastify");
const apiUtils_1 = require("../../utils/apiUtils");
require("./ErrorBoundary.css");
/**
 * ErrorBoundary component to catch JavaScript errors in child component tree
 * and display a fallback UI instead of crashing the whole application.
 */
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log the error to our logging service
        apiUtils_1.apiLogger.error('React component error caught by ErrorBoundary', error, {
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
        react_toastify_1.toast.error(`An error occurred: ${error.message}`, {
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
    render() {
        if (this.state.hasError) {
            // If a custom fallback is provided, use it
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Otherwise, render a default error UI
            return (<div className="error-boundary-container">
          <div className="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>We've encountered an error and are working to fix it.</p>
            <div className="error-actions">
              <button onClick={() => window.location.reload()} className="error-reload-btn">
                Reload Page
              </button>
              <button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })} className="error-try-again-btn">
                Try Again
              </button>
            </div>
            
            {/* In development mode, show the error details */}
            {process.env.NODE_ENV === 'development' && (<div className="error-details">
                <h3>Error Details:</h3>
                <p className="error-message">{this.state.error?.toString()}</p>
                <div className="error-stack">
                  <pre>{this.state.error?.stack}</pre>
                </div>
                {this.state.errorInfo && (<div className="component-stack">
                    <h4>Component Stack:</h4>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>)}
              </div>)}
          </div>
        </div>);
        }
        // If no error, render children normally
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map