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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRateLimit = exports.RateLimitProvider = void 0;
const react_1 = __importStar(require("react"));
const RateLimitService_1 = __importDefault(require("../services/RateLimitService"));
// Create the context with a default value
const RateLimitContext = (0, react_1.createContext)(undefined);
/**
 * Provider component for the RateLimitContext
 * Provides access to the rate limit service throughout the application
 */
const RateLimitProvider = ({ children, }) => {
    // State for the current status, history and settings
    const [status, setStatus] = (0, react_1.useState)(RateLimitService_1.default.getStatus());
    const [history, setHistory] = (0, react_1.useState)(RateLimitService_1.default.getHistory());
    const [settings, setSettings] = (0, react_1.useState)(RateLimitService_1.default.getSettings());
    const [latestToolCall, setLatestToolCall] = (0, react_1.useState)(null);
    // Set up a listener for status updates
    (0, react_1.useEffect)(() => {
        // Register a listener with the service
        const unsubscribe = RateLimitService_1.default.registerListener((newStatus) => {
            setStatus(newStatus);
        });
        // Clean up the listener when the component unmounts
        return () => {
            unsubscribe();
        };
    }, []);
    // Set up a real-time listener for tool calls
    (0, react_1.useEffect)(() => {
        // Register a real-time listener with the service
        const unsubscribe = RateLimitService_1.default.registerRealTimeListener((toolCall) => {
            // Update the latest tool call
            setLatestToolCall(toolCall);
            // Update the history immediately
            setHistory((prevHistory) => [toolCall, ...prevHistory]);
        });
        // Clean up the listener when the component unmounts
        return () => {
            unsubscribe();
        };
    }, []);
    // Refresh the history periodically as a backup to real-time updates
    (0, react_1.useEffect)(() => {
        // Initial update
        setHistory(RateLimitService_1.default.getHistory());
        // Set up an interval to update every 5 seconds
        const interval = setInterval(() => {
            setHistory(RateLimitService_1.default.getHistory());
            setSettings(RateLimitService_1.default.getSettings());
        }, 5000);
        // Clear the interval when the component unmounts
        return () => {
            clearInterval(interval);
        };
    }, []);
    /**
     * Update the settings
     */
    const updateSettings = (newSettings) => {
        RateLimitService_1.default.updateSettings(newSettings);
        setSettings(RateLimitService_1.default.getSettings());
    };
    /**
     * Execute a bypass
     */
    const executeBypass = () => {
        RateLimitService_1.default.executeBypass();
    };
    /**
     * Reset the settings to defaults
     */
    const resetSettings = () => {
        RateLimitService_1.default.resetSettings();
        setSettings(RateLimitService_1.default.getSettings());
    };
    /**
     * Record a tool call
     */
    const recordToolCall = (tool, status = "success", parameters) => {
        RateLimitService_1.default.recordToolCall(tool, status, parameters);
        // No need to update history immediately as the real-time listener will handle it
    };
    /**
     * Simulate multiple tool calls for testing
     */
    const simulateToolCalls = (count) => {
        const tools = [
            "read_file",
            "codebase_search",
            "grep_search",
            "web_search",
            "list_dir",
        ];
        for (let i = 0; i < count; i++) {
            const randomTool = tools[Math.floor(Math.random() * tools.length)];
            const randomStatus = Math.random() > 0.9 ? "warning" : "success";
            recordToolCall(randomTool, randomStatus, {
                demo: true,
                timestamp: new Date().toISOString(),
            });
        }
    };
    /**
     * Force a reset of the tool call count
     */
    const forceReset = () => {
        RateLimitService_1.default.forceReset();
    };
    /**
     * Check if the interceptor is active
     */
    const [isInterceptorActive, setIsInterceptorActive] = (0, react_1.useState)(RateLimitService_1.default.isInterceptorActive);
    // Update the interceptor status when it changes
    (0, react_1.useEffect)(() => {
        const checkInterceptorStatus = () => {
            setIsInterceptorActive(RateLimitService_1.default.isInterceptorActive);
        };
        // Check initially
        checkInterceptorStatus();
        // Set up an interval to check periodically
        const interval = setInterval(checkInterceptorStatus, 1000); // Check more frequently for real-time updates
        return () => {
            clearInterval(interval);
        };
    }, []);
    /**
     * Explicitly activate the tool call interceptor
     */
    const activateToolCallInterceptor = () => {
        RateLimitService_1.default.activateToolCallInterceptor();
        setIsInterceptorActive(true);
    };
    /**
     * Explicitly deactivate the tool call interceptor
     */
    const deactivateToolCallInterceptor = () => {
        // Use the public method to deactivate the interceptor
        RateLimitService_1.default.deactivateToolCallInterceptor();
        setIsInterceptorActive(false);
    };
    // Provide the context values to children
    return (<RateLimitContext.Provider value={{
            status,
            history,
            settings,
            updateSettings,
            executeBypass,
            resetSettings,
            recordToolCall,
            simulateToolCalls,
            forceReset,
            isInterceptorActive,
            activateToolCallInterceptor,
            deactivateToolCallInterceptor,
            latestToolCall,
        }}>
      {children}
    </RateLimitContext.Provider>);
};
exports.RateLimitProvider = RateLimitProvider;
/**
 * Hook to use the RateLimitContext
 * Returns the context value and throws an error if used outside of a provider
 */
const useRateLimit = () => {
    const context = (0, react_1.useContext)(RateLimitContext);
    if (context === undefined) {
        throw new Error("useRateLimit must be used within a RateLimitProvider");
    }
    return context;
};
exports.useRateLimit = useRateLimit;
exports.default = RateLimitContext;
//# sourceMappingURL=RateLimitContext.js.map