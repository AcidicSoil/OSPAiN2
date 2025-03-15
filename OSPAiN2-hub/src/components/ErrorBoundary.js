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
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
/**
 * ErrorBoundary Component
 *
 * A React error boundary that catches JavaScript errors anywhere in its child
 * component tree and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.handleReset = () => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
            });
        };
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log the error to the console
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
        // Update state with error info
        this.setState({
            error,
            errorInfo,
        });
    }
    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Otherwise, use default error UI
            return (<material_1.Paper elevation={3} sx={{
                    p: 3,
                    m: 2,
                    backgroundColor: "rgba(255, 235, 235, 0.8)",
                    border: "1px solid #ffcccc",
                }}>
          <material_1.Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </material_1.Typography>

          <material_1.Typography variant="body1" paragraph>
            An error occurred in this component.
          </material_1.Typography>

          {this.state.error && (<material_1.Box sx={{
                        my: 2,
                        p: 2,
                        backgroundColor: "#f8f8f8",
                        borderRadius: 1,
                        maxHeight: "200px",
                        overflow: "auto",
                    }}>
              <material_1.Typography variant="body2" component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                {this.state.error.toString()}
              </material_1.Typography>
            </material_1.Box>)}

          <material_1.Button variant="contained" color="primary" startIcon={<icons_material_1.Refresh />} onClick={this.handleReset} sx={{ mt: 2 }}>
            Try Again
          </material_1.Button>
        </material_1.Paper>);
        }
        // If there's no error, render children normally
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map