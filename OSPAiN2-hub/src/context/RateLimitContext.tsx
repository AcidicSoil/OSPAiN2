import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import rateLimitService, {
  RateLimitStatus,
  ToolCallRecord,
  RateLimitSettings,
} from "../services/RateLimitService";

/**
 * Interface for the RateLimitContext
 */
export interface RateLimitContextType {
  status: RateLimitStatus;
  history: ToolCallRecord[];
  settings: RateLimitSettings;
  updateSettings: (newSettings: Partial<RateLimitSettings>) => void;
  executeBypass: () => void;
  resetSettings: () => void;
  recordToolCall: (
    tool: string,
    status?: "success" | "warning" | "error",
    parameters?: Record<string, any>
  ) => void;
  simulateToolCalls: (count: number) => void;
  forceReset: () => void;
  isInterceptorActive?: boolean;
  activateToolCallInterceptor?: () => void;
  deactivateToolCallInterceptor?: () => void;
  latestToolCall: ToolCallRecord | null;
}

// Create the context with a default value
const RateLimitContext = createContext<RateLimitContextType | undefined>(
  undefined
);

/**
 * Props for the RateLimitProvider component
 */
interface RateLimitProviderProps {
  children: ReactNode;
}

/**
 * Provider component for the RateLimitContext
 * Provides access to the rate limit service throughout the application
 */
export const RateLimitProvider: React.FC<RateLimitProviderProps> = ({
  children,
}) => {
  // State for the current status, history and settings
  const [status, setStatus] = useState<RateLimitStatus>(
    rateLimitService.getStatus()
  );
  const [history, setHistory] = useState<ToolCallRecord[]>(
    rateLimitService.getHistory()
  );
  const [settings, setSettings] = useState<RateLimitSettings>(
    rateLimitService.getSettings()
  );
  const [latestToolCall, setLatestToolCall] = useState<ToolCallRecord | null>(
    null
  );

  // Set up a listener for status updates
  useEffect(() => {
    // Register a listener with the service
    const unsubscribe = rateLimitService.registerListener((newStatus) => {
      setStatus(newStatus);
    });

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  // Set up a real-time listener for tool calls
  useEffect(() => {
    // Register a real-time listener with the service
    const unsubscribe = rateLimitService.registerRealTimeListener(
      (toolCall) => {
        // Update the latest tool call
        setLatestToolCall(toolCall);

        // Update the history immediately
        setHistory((prevHistory) => [toolCall, ...prevHistory]);
      }
    );

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  // Refresh the history periodically as a backup to real-time updates
  useEffect(() => {
    // Initial update
    setHistory(rateLimitService.getHistory());

    // Set up an interval to update every 5 seconds
    const interval = setInterval(() => {
      setHistory(rateLimitService.getHistory());
      setSettings(rateLimitService.getSettings());
    }, 5000);

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []);

  /**
   * Update the settings
   */
  const updateSettings = (newSettings: Partial<RateLimitSettings>) => {
    rateLimitService.updateSettings(newSettings);
    setSettings(rateLimitService.getSettings());
  };

  /**
   * Execute a bypass
   */
  const executeBypass = () => {
    rateLimitService.executeBypass();
  };

  /**
   * Reset the settings to defaults
   */
  const resetSettings = () => {
    rateLimitService.resetSettings();
    setSettings(rateLimitService.getSettings());
  };

  /**
   * Record a tool call
   */
  const recordToolCall = (
    tool: string,
    status: "success" | "warning" | "error" = "success",
    parameters?: Record<string, any>
  ) => {
    rateLimitService.recordToolCall(tool, status, parameters);
    // No need to update history immediately as the real-time listener will handle it
  };

  /**
   * Simulate multiple tool calls for testing
   */
  const simulateToolCalls = (count: number) => {
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

      recordToolCall(randomTool, randomStatus as "success" | "warning", {
        demo: true,
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Force a reset of the tool call count
   */
  const forceReset = () => {
    rateLimitService.forceReset();
  };

  /**
   * Check if the interceptor is active
   */
  const [isInterceptorActive, setIsInterceptorActive] = useState<boolean>(
    rateLimitService.isInterceptorActive
  );

  // Update the interceptor status when it changes
  useEffect(() => {
    const checkInterceptorStatus = () => {
      setIsInterceptorActive(rateLimitService.isInterceptorActive);
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
    rateLimitService.activateToolCallInterceptor();
    setIsInterceptorActive(true);
  };

  /**
   * Explicitly deactivate the tool call interceptor
   */
  const deactivateToolCallInterceptor = () => {
    // Use the public method to deactivate the interceptor
    rateLimitService.deactivateToolCallInterceptor();
    setIsInterceptorActive(false);
  };

  // Provide the context values to children
  return (
    <RateLimitContext.Provider
      value={{
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
      }}
    >
      {children}
    </RateLimitContext.Provider>
  );
};

/**
 * Hook to use the RateLimitContext
 * Returns the context value and throws an error if used outside of a provider
 */
export const useRateLimit = (): RateLimitContextType => {
  const context = useContext(RateLimitContext);

  if (context === undefined) {
    throw new Error("useRateLimit must be used within a RateLimitProvider");
  }

  return context;
};

export default RateLimitContext;
