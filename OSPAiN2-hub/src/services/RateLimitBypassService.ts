/**
 * RateLimitBypassService
 *
 * A service that handles tool call rate limit monitoring and bypass methods.
 * This is a crucial part of the OSPAiN₂ ecosystem to ensure uninterrupted
 * AI assistant functionality.
 */

export interface BypassSettings {
  autoBypass: boolean;
  bypassMethod:
    | "session-rotation"
    | "token-management"
    | "cache-optimization"
    | "request-batching"
    | "custom-rules";
  notificationThreshold: number;
  enableNotifications: boolean;
  monitorInterval: number;
  excludedTools: string[];
  customBypassRules?: string;
}

export interface ToolCallStatus {
  current: number;
  limit: number;
  percentage: number;
  bypassStatus: "inactive" | "active" | "pending";
  nextReset: string;
  currentMethod?: string;
}

export interface ToolCall {
  id: number;
  tool: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  bypassMethod: string;
}

// Default settings
const defaultSettings: BypassSettings = {
  autoBypass: true,
  bypassMethod: "session-rotation",
  notificationThreshold: 75,
  enableNotifications: true,
  monitorInterval: 30,
  excludedTools: ["web_search", "diff_history"],
  customBypassRules: "",
};

class RateLimitBypassService {
  private settings: BypassSettings;
  private toolCallHistory: ToolCall[] = [];
  private toolCallStatus: ToolCallStatus = {
    current: 0,
    limit: 25,
    percentage: 0,
    bypassStatus: "inactive",
    nextReset: "--:--:--",
  };
  private monitoringInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: ToolCallStatus) => void> = [];

  constructor() {
    // Load settings from localStorage or use defaults
    this.settings = this.loadSettings();
    this.loadHistory();

    // Start monitoring if auto-bypass is enabled
    if (this.settings.autoBypass) {
      this.startMonitoring();
    }
  }

  /**
   * Load settings from localStorage or return defaults
   */
  private loadSettings(): BypassSettings {
    try {
      const savedSettings = localStorage.getItem("rateLimitBypassSettings");
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error("Error loading rate limit bypass settings:", error);
      return defaultSettings;
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(
        "rateLimitBypassSettings",
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error("Error saving rate limit bypass settings:", error);
    }
  }

  /**
   * Load tool call history from localStorage
   */
  private loadHistory(): void {
    try {
      const savedHistory = localStorage.getItem("toolCallHistory");
      this.toolCallHistory = savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Error loading tool call history:", error);
      this.toolCallHistory = [];
    }
  }

  /**
   * Save tool call history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(
        "toolCallHistory",
        JSON.stringify(this.toolCallHistory)
      );
    } catch (error) {
      console.error("Error saving tool call history:", error);
    }
  }

  /**
   * Start monitoring tool calls for rate limit
   */
  public startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Update status immediately
    this.updateStatus();

    // Set up interval for checking status
    this.monitoringInterval = setInterval(() => {
      this.updateStatus();

      // Check if auto bypass should be triggered
      if (
        this.settings.autoBypass &&
        this.toolCallStatus.percentage >= this.settings.notificationThreshold &&
        this.toolCallStatus.bypassStatus !== "active"
      ) {
        this.executeBypass();
      }
    }, this.settings.monitorInterval * 1000);
  }

  /**
   * Stop monitoring tool calls
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Update the current tool call status
   */
  private updateStatus(): void {
    // In a real app, this would query the current state
    // from an API or other source

    // Mock implementation for now
    const resetTime = new Date();
    resetTime.setHours(resetTime.getHours() + 1);

    // Calculate current tool call count based on "session"
    const sessionStartTime = new Date();
    sessionStartTime.setHours(sessionStartTime.getHours() - 1);

    const sessionCalls = this.toolCallHistory.filter(
      (call) => new Date(call.timestamp).getTime() > sessionStartTime.getTime()
    );

    this.toolCallStatus = {
      current: sessionCalls.length,
      limit: 25,
      percentage: Math.min(Math.floor((sessionCalls.length / 25) * 100), 100),
      bypassStatus: this.toolCallStatus.bypassStatus,
      nextReset: resetTime.toLocaleTimeString(),
      currentMethod: this.settings.bypassMethod,
    };

    // Notify listeners of the status update
    this.notifyListeners();
  }

  /**
   * Execute the appropriate bypass method
   */
  public executeBypass(): void {
    console.log(`Executing bypass using method: ${this.settings.bypassMethod}`);

    this.toolCallStatus.bypassStatus = "pending";
    this.notifyListeners();

    // Simulate method execution with a delay
    setTimeout(() => {
      // In a real implementation, this would execute the actual bypass methods

      switch (this.settings.bypassMethod) {
        case "session-rotation":
          // This would rotate the session to reset tool call counts
          console.log("Rotating session...");
          break;
        case "token-management":
          // This would manage tokens to optimize usage
          console.log("Optimizing token usage...");
          break;
        case "cache-optimization":
          // This would optimize caching to reduce calls
          console.log("Optimizing cache strategy...");
          break;
        case "request-batching":
          // This would batch requests to reduce call count
          console.log("Implementing request batching...");
          break;
        case "custom-rules":
          // This would execute custom rules
          console.log("Executing custom rules...");
          break;
      }

      // Record the bypass in history
      this.recordToolCall({
        tool: "bypass_service",
        timestamp: new Date().toLocaleTimeString(),
        status: "success",
        bypassMethod: this.settings.bypassMethod,
      });

      // Update status to show bypass is active
      this.toolCallStatus.bypassStatus = "active";
      this.notifyListeners();

      // Reset counter for demo purposes
      this.toolCallStatus.current = 0;
      this.toolCallStatus.percentage = 0;
      this.notifyListeners();
    }, 1500);

    return;
  }

  /**
   * Record a new tool call in the history
   */
  public recordToolCall(call: Omit<ToolCall, "id">): void {
    // Guard against undefined or null call objects
    if (!call) {
      console.error("Attempted to record undefined or null tool call");
      return;
    }

    const newCall: ToolCall = {
      id: this.toolCallHistory.length + 1,
      ...call,
    };

    this.toolCallHistory = [newCall, ...this.toolCallHistory];
    this.saveHistory();

    // Update status after recording call
    this.updateStatus();
  }

  /**
   * Get the current settings
   */
  public getSettings(): BypassSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  public updateSettings(newSettings: Partial<BypassSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };

    this.saveSettings();

    // Restart monitoring if settings changed
    if (this.settings.autoBypass) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }

  /**
   * Reset settings to defaults
   */
  public resetSettings(): void {
    this.settings = { ...defaultSettings };
    this.saveSettings();

    // Restart monitoring with default settings
    if (this.settings.autoBypass) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }

  /**
   * Get the current tool call status
   */
  public getStatus(): ToolCallStatus {
    return { ...this.toolCallStatus };
  }

  /**
   * Get tool call history
   */
  public getHistory(limit?: number): ToolCall[] {
    return limit
      ? this.toolCallHistory.slice(0, limit)
      : [...this.toolCallHistory];
  }

  /**
   * Register a listener for status updates
   */
  public registerListener(
    callback: (status: ToolCallStatus) => void
  ): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Notify all listeners of status updates
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.toolCallStatus });
      } catch (error) {
        console.error("Error in rate limit bypass listener:", error);
      }
    });
  }
}

// Export a singleton instance
const rateLimitBypassService = new RateLimitBypassService();
export default rateLimitBypassService;
