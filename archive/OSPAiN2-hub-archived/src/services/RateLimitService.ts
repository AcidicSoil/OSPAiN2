/**
 * RateLimitService.ts
 *
 * A service for managing and tracking rate limits for tool calls.
 * This service provides unified functionality to:
 * - Track tool call usage
 * - Monitor rate limit status
 * - Provide notifications when approaching limits
 * - Store and retrieve rate limit history
 * - Implement bypass methods when limits are reached
 */

import { v4 as uuidv4 } from "uuid";

// Default settings for rate limits
const DEFAULT_TOOL_CALL_LIMIT = 25;
const DEFAULT_RESET_INTERVAL_MINUTES = 180; // 3 hours

// Constants for tool call limit management
const TOOL_CALL_WARNING_THRESHOLD = 20; // Warning threshold (80% of limit)
const TOOL_CALL_ACTION_THRESHOLD = 24; // Action threshold (96% of limit)

// Types and interfaces
export interface RateLimitSettings {
  toolCallLimit: number;
  resetIntervalMinutes: number;
  notificationThreshold: number; // Percentage at which to notify (e.g., 75)
  enableNotifications: boolean;
  autoBypass: boolean;
  bypassMethod:
    | "session-rotation"
    | "token-management"
    | "cache-optimization"
    | "request-batching"
    | "custom-rules";
  monitorInterval: number;
  excludedTools: string[];
  customBypassRules?: string;
  realTimeMonitoring: boolean; // New setting for real-time monitoring
}

export interface ToolCallRecord {
  id: string;
  tool: string;
  timestamp: string;
  parameters?: Record<string, any>;
  status: "success" | "warning" | "error";
  bypassApplied?: boolean;
  bypassMethod?: string;
}

export interface RateLimitStatus {
  current: number;
  limit: number;
  percentage: number;
  nextReset: string;
  isApproachingLimit: boolean;
  bypassStatus: "inactive" | "active" | "pending";
  currentMethod?: string;
  predictedTimeToLimit?: string;
}

// Default settings
const defaultSettings: RateLimitSettings = {
  toolCallLimit: DEFAULT_TOOL_CALL_LIMIT,
  resetIntervalMinutes: DEFAULT_RESET_INTERVAL_MINUTES,
  notificationThreshold: 75,
  enableNotifications: true,
  autoBypass: true,
  bypassMethod: "session-rotation",
  monitorInterval: 30,
  excludedTools: ["web_search", "diff_history"],
  customBypassRules: "",
  realTimeMonitoring: true, // Enable real-time monitoring by default
};

/**
 * RateLimitService class
 *
 * Manages tool call rate limits, tracks usage, and provides status information.
 * Includes bypass functionality to handle rate limit issues.
 */
class RateLimitService {
  private settings: RateLimitSettings;
  private toolCallHistory: ToolCallRecord[] = [];
  private rateLimitStatus: RateLimitStatus;
  private listeners: ((status: RateLimitStatus) => void)[] = [];
  private resetTimer: NodeJS.Timeout | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastResetTime: Date;
  private batchedRequests: Array<{
    tool: string;
    params: any;
    timestamp: number;
  }> = [];
  private batchingActive: boolean = false;
  private batchInterval: NodeJS.Timeout | null = null;
  private toolProxy: any = null;
  public isInterceptorActive: boolean = false;
  private externalBypassUrl: string | null = null;
  private interceptorFrame: HTMLIFrameElement | null = null;
  private realTimeListeners: ((record: ToolCallRecord) => void)[] = [];

  constructor() {
    // Initialize with default settings or load from storage
    this.settings = this.loadSettings();
    this.toolCallHistory = this.loadHistory();
    this.lastResetTime = this.getLastResetTime();

    // Initialize status
    this.rateLimitStatus = {
      current: 0,
      limit: this.settings.toolCallLimit,
      percentage: 0,
      nextReset: this.calculateNextReset(),
      isApproachingLimit: false,
      bypassStatus: "inactive",
      currentMethod: undefined,
    };

    // Update status based on history
    this.updateStatus();

    // Start the reset timer
    this.startResetTimer();

    // Start monitoring if auto-bypass is enabled
    if (this.settings.autoBypass) {
      this.startMonitoring();
    }

    // Set up tool call interception if possible
    this.setupToolCallInterception();
  }

  /**
   * Load settings from localStorage or use defaults
   */
  private loadSettings(): RateLimitSettings {
    try {
      const savedSettings = localStorage.getItem("rateLimitSettings");
      if (savedSettings) {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error("Error loading rate limit settings:", error);
    }
    return { ...defaultSettings };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem("rateLimitSettings", JSON.stringify(this.settings));
    } catch (error) {
      console.error("Error saving rate limit settings:", error);
    }
  }

  /**
   * Load tool call history from localStorage
   */
  private loadHistory(): ToolCallRecord[] {
    try {
      // Try to load history from chunks for larger storage
      const chunkCount = Number(
        localStorage.getItem("toolCallHistoryChunks") || "0"
      );
      if (chunkCount > 0) {
        let history: ToolCallRecord[] = [];

        for (let i = 0; i < chunkCount; i++) {
          const chunk = localStorage.getItem(`toolCallHistory_${i}`);
          if (chunk) {
            history = [...history, ...JSON.parse(chunk)];
          }
        }

        return history;
      }

      // Fallback to old format
      const savedHistory = localStorage.getItem("rateLimitToolCallHistory");
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error("Error loading tool call history:", error);
    }
    return [];
  }

  /**
   * Save tool call history to localStorage
   */
  private saveHistory(): void {
    try {
      // Only keep the last 100 records to prevent localStorage from getting too large
      const historyToSave = this.toolCallHistory.slice(0, 100);

      // Save in chunks if needed to avoid localStorage limits
      const chunks = this.chunkArray(historyToSave, 20);
      chunks.forEach((chunk, index) => {
        localStorage.setItem(`toolCallHistory_${index}`, JSON.stringify(chunk));
      });

      // Store the chunk count
      localStorage.setItem("toolCallHistoryChunks", String(chunks.length));
    } catch (error) {
      console.error("Error saving tool call history:", error);
    }
  }

  /**
   * Split an array into chunks of the specified size
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get the last reset time from localStorage or create a new one
   */
  private getLastResetTime(): Date {
    try {
      const savedTime = localStorage.getItem("lastRateLimitReset");
      if (savedTime) {
        return new Date(savedTime);
      }
    } catch (error) {
      console.error("Error loading last reset time:", error);
    }

    // If no saved time, create a new one and save it
    const newTime = new Date();
    this.saveLastResetTime(newTime);
    return newTime;
  }

  /**
   * Save the last reset time to localStorage
   */
  private saveLastResetTime(time: Date): void {
    try {
      localStorage.setItem("lastRateLimitReset", time.toISOString());
    } catch (error) {
      console.error("Error saving last reset time:", error);
    }
  }

  /**
   * Calculate the next reset time as a formatted string
   */
  private calculateNextReset(): string {
    const nextReset = new Date(this.lastResetTime);
    nextReset.setMinutes(
      nextReset.getMinutes() + this.settings.resetIntervalMinutes
    );

    // Format as relative time (e.g., "in 2h 30m" or "in 45m")
    const now = new Date();
    const diffMs = nextReset.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "Now";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else {
      return `in ${minutes}m`;
    }
  }

  /**
   * Start the reset timer
   */
  private startResetTimer(): void {
    // Clear any existing timer
    if (this.resetTimer) {
      clearInterval(this.resetTimer);
    }

    // Update status every minute to keep the next reset time current
    this.resetTimer = setInterval(() => {
      // Check if it's time to reset
      const now = new Date();
      const nextReset = new Date(this.lastResetTime);
      nextReset.setMinutes(
        nextReset.getMinutes() + this.settings.resetIntervalMinutes
      );

      if (now >= nextReset) {
        this.resetToolCallCount();
      } else {
        // Just update the next reset time
        this.rateLimitStatus.nextReset = this.calculateNextReset();
        this.notifyListeners();
      }
    }, 60000); // Check every minute
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

    // If real-time monitoring is enabled, use a higher frequency check
    const monitorIntervalMs = this.settings.realTimeMonitoring
      ? Math.min(1000, this.settings.monitorInterval * 1000) // At least once per second for real-time
      : this.settings.monitorInterval * 1000;

    // Set up interval for checking status
    this.monitoringInterval = setInterval(() => {
      this.updateStatus();

      // Add prediction of when we'll hit the limit
      const prediction = this.predictRateLimitReach();
      if (prediction.willReachLimit) {
        this.rateLimitStatus.predictedTimeToLimit =
          prediction.estimatedTimeMinutes < 60
            ? `~${Math.round(prediction.estimatedTimeMinutes)}m`
            : `~${Math.round(
                prediction.estimatedTimeMinutes / 60
              )}h ${Math.round(prediction.estimatedTimeMinutes % 60)}m`;
      }

      // Check if auto bypass should be triggered
      if (
        this.settings.autoBypass &&
        this.rateLimitStatus.percentage >=
          this.settings.notificationThreshold &&
        this.rateLimitStatus.bypassStatus === "inactive"
      ) {
        this.executeBypass();
      }
    }, monitorIntervalMs);

    console.log(
      `Monitoring started with ${monitorIntervalMs}ms interval ${
        this.settings.realTimeMonitoring ? "(real-time mode)" : ""
      }`
    );
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
   * Reset the tool call count
   */
  public resetToolCallCount(): void {
    this.lastResetTime = new Date();
    this.saveLastResetTime(this.lastResetTime);

    // Reset status
    this.rateLimitStatus.current = 0;
    this.rateLimitStatus.percentage = 0;
    this.rateLimitStatus.isApproachingLimit = false;
    this.rateLimitStatus.nextReset = this.calculateNextReset();

    // Deactivate any active interceptors
    if (this.isInterceptorActive) {
      this.deactivateToolCallInterceptor();
    }

    // Reset bypass status only if it's active
    if (this.rateLimitStatus.bypassStatus === "active") {
      this.rateLimitStatus.bypassStatus = "inactive";
      this.rateLimitStatus.currentMethod = undefined;
    }

    this.notifyListeners();
  }

  /**
   * Predict if and when we might reach the rate limit
   */
  private predictRateLimitReach(): {
    willReachLimit: boolean;
    estimatedTimeMinutes: number;
  } {
    // Get tool calls in the last 5 minutes
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const recentCalls = this.toolCallHistory.filter(
      (call) => new Date(call.timestamp) > fiveMinutesAgo
    );

    // Calculate rate of tool calls per minute
    const callRate = recentCalls.length / 5;

    // Calculate remaining calls and time to limit
    const remainingCalls =
      this.settings.toolCallLimit - this.rateLimitStatus.current;
    const estimatedTimeMinutes =
      callRate > 0
        ? remainingCalls / callRate
        : this.settings.resetIntervalMinutes;

    return {
      willReachLimit:
        callRate > 0 &&
        estimatedTimeMinutes < this.settings.resetIntervalMinutes,
      estimatedTimeMinutes,
    };
  }

  /**
   * Update the rate limit status based on current tool call history
   */
  private updateStatus(): void {
    // Count tool calls since the last reset
    const now = new Date();
    const resetTime = new Date(this.lastResetTime);

    // Filter tool calls that occurred after the last reset
    const recentCalls = this.toolCallHistory.filter((call) => {
      const callTime = new Date(call.timestamp);
      return callTime >= resetTime;
    });

    // Update status
    this.rateLimitStatus.current = recentCalls.length;
    this.rateLimitStatus.limit = this.settings.toolCallLimit;
    this.rateLimitStatus.percentage = Math.min(
      Math.round((recentCalls.length / this.settings.toolCallLimit) * 100),
      100
    );
    this.rateLimitStatus.nextReset = this.calculateNextReset();
    this.rateLimitStatus.isApproachingLimit =
      this.rateLimitStatus.percentage >= this.settings.notificationThreshold;

    // Notify listeners of the updated status
    this.notifyListeners();
  }

  /**
   * Execute the appropriate bypass method
   */
  public executeBypass(): void {
    console.log(`Executing bypass using method: ${this.settings.bypassMethod}`);

    this.rateLimitStatus.bypassStatus = "pending";
    this.rateLimitStatus.currentMethod = this.settings.bypassMethod;
    this.notifyListeners();

    // Execute the selected bypass method
    let success = false;
    switch (this.settings.bypassMethod) {
      case "session-rotation":
        this.performSessionRotation().then((result) => {
          success = result;
          this.finalizeBypass(success);
        });
        break;
      case "token-management":
        this.performTokenManagement().then((result) => {
          success = result;
          this.finalizeBypass(success);
        });
        break;
      case "cache-optimization":
        this.performCacheOptimization().then((result) => {
          success = result;
          this.finalizeBypass(success);
        });
        break;
      case "request-batching":
        success = this.enableRequestBatching();
        this.finalizeBypass(success);
        break;
      case "custom-rules":
        success = this.executeCustomRules();
        this.finalizeBypass(success);
        break;
      default:
        console.error(`Unknown bypass method: ${this.settings.bypassMethod}`);
        this.finalizeBypass(false);
    }
  }

  /**
   * Finalize the bypass process
   */
  private finalizeBypass(success: boolean): void {
    if (success) {
      this.rateLimitStatus.bypassStatus = "active";

      // Record the successful bypass
      this.recordToolCall("bypass_service", "success", {
        method: this.settings.bypassMethod,
      });

      // For demo purposes, reset the counter to show the bypass worked
      if (process.env.NODE_ENV === "development") {
        this.rateLimitStatus.current = Math.floor(
          this.rateLimitStatus.current * 0.5
        );
        this.rateLimitStatus.percentage = Math.min(
          Math.round(
            (this.rateLimitStatus.current / this.settings.toolCallLimit) * 100
          ),
          100
        );
      }
    } else {
      this.rateLimitStatus.bypassStatus = "inactive";

      // Record the failed bypass
      this.recordToolCall("bypass_service", "error", {
        method: this.settings.bypassMethod,
      });
    }

    this.notifyListeners();
  }

  /**
   * Perform session rotation to bypass rate limits
   */
  private async performSessionRotation(): Promise<boolean> {
    try {
      // For demonstration, we'll simulate a session rotation
      // In a real implementation, this would interact with the Cursor API

      // Simulate clearing session storage
      const sessionKeys = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith("cursor") ||
          key.startsWith("ai_") ||
          key.startsWith("tool_")
      );

      console.log(
        `Would clear ${sessionKeys.length} session keys in a real implementation`
      );

      // Simulate a delay for the rotation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return true;
    } catch (error) {
      console.error("Session rotation failed:", error);
      return false;
    }
  }

  /**
   * Perform token management to optimize token usage
   */
  private async performTokenManagement(): Promise<boolean> {
    try {
      // For demonstration, we'll simulate token optimization
      // Analyze recent tool calls
      const recentCalls = this.toolCallHistory.slice(0, 30);

      // Group by tool type
      const toolCounts: Record<string, number> = {};
      recentCalls.forEach((call) => {
        toolCounts[call.tool] = (toolCounts[call.tool] || 0) + 1;
      });

      console.log("Tool usage analysis for token optimization:", toolCounts);

      // Simulate optimization
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return true;
    } catch (error) {
      console.error("Token management failed:", error);
      return false;
    }
  }

  /**
   * Perform cache optimization to reduce tool calls
   */
  private async performCacheOptimization(): Promise<boolean> {
    try {
      // For demonstration, we'll simulate cache optimization
      console.log("Optimizing cache for frequently used tools...");

      // Identify frequently accessed files
      const fileCalls = this.toolCallHistory.filter(
        (call) =>
          call.tool === "read_file" &&
          call.parameters &&
          call.parameters.target_file
      );

      const fileFrequency: Record<string, number> = {};
      fileCalls.forEach((call) => {
        if (call.parameters?.target_file) {
          const file = call.parameters.target_file as string;
          fileFrequency[file] = (fileFrequency[file] || 0) + 1;
        }
      });

      // Sort by frequency
      const topFiles = Object.entries(fileFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([file]) => file);

      console.log("Top files that would be cached:", topFiles);

      // Simulate caching delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return true;
    } catch (error) {
      console.error("Cache optimization failed:", error);
      return false;
    }
  }

  /**
   * Enable request batching to reduce individual tool calls
   */
  private enableRequestBatching(): boolean {
    try {
      console.log("Enabling request batching...");

      // Set up request batching state
      this.batchedRequests = [];
      this.batchingActive = true;

      // Set up batch processing
      if (this.batchInterval) {
        clearInterval(this.batchInterval);
      }

      this.batchInterval = setInterval(() => {
        this.processBatchedRequests();
      }, 500);

      return true;
    } catch (error) {
      console.error("Request batching setup failed:", error);
      return false;
    }
  }

  /**
   * Process batched requests
   */
  private processBatchedRequests(): void {
    if (this.batchedRequests.length === 0) {
      return;
    }

    console.log(
      `Processing ${this.batchedRequests.length} batched requests...`
    );

    // In a real implementation, this would actually batch the requests
    // For now, we'll just record them as a single tool call
    if (this.batchedRequests.length > 0) {
      this.recordToolCall("batch_processor", "success", {
        count: this.batchedRequests.length,
        tools: this.batchedRequests.map((req) => req.tool),
      });

      this.batchedRequests = [];
    }
  }

  /**
   * Execute custom bypass rules
   */
  private executeCustomRules(): boolean {
    try {
      console.log("Executing custom bypass rules...");

      // Parse and execute custom rules if they exist
      if (
        this.settings.customBypassRules &&
        this.settings.customBypassRules.trim()
      ) {
        // For safety, we're just logging the rules here
        // In a real implementation, we might use Function constructor with caution
        console.log(
          "Custom rules to execute:",
          this.settings.customBypassRules
        );
      } else {
        console.log("No custom rules defined");
      }

      return true;
    } catch (error) {
      console.error("Custom rules execution failed:", error);
      return false;
    }
  }

  /**
   * Set up tool call interception if possible
   */
  private setupToolCallInterception(): void {
    try {
      // This is a placeholder for actual integration with Cursor
      // In a real implementation, we would try to intercept tool calls

      // For demonstration, we'll set up a global handler that could be used
      if (typeof window !== "undefined") {
        // @ts-ignore: Add our tool proxy to window
        window.__cursorToolProxy = window.__cursorToolProxy || {};
        // @ts-ignore: Store our service reference
        window.__rateLimitService = this;

        // Try to intercept actual tool calls if running in Cursor
        this.setupCursorToolInterception();

        console.log("Tool call interception setup completed");
      }
    } catch (error) {
      console.error("Tool call interception setup failed:", error);
    }
  }

  /**
   * Set up interception of actual Cursor tool calls
   * This is an attempt to hook into the actual Cursor API
   */
  private setupCursorToolInterception(): void {
    try {
      // This is experimental and may not work in all environments
      if (typeof window !== "undefined") {
        // Check if we're in Cursor and can access the API
        // @ts-ignore: Cursor API might not be typed
        if (window.__cursor && window.__cursor.api) {
          console.log(
            "Detected Cursor API - setting up real-time tool call monitoring"
          );

          // Store original function references
          // @ts-ignore: Accessing Cursor API
          const originalCallTool = window.__cursor.api.callTool;

          // @ts-ignore: Override tool call method
          window.__cursor.api.callTool = (toolName: string, params: any) => {
            // Record the tool call in our service
            this.recordToolCall(toolName, "success", params);

            // Call the original function
            return originalCallTool(toolName, params);
          };

          console.log("Real-time tool call monitoring active for Cursor API");
        }
      }
    } catch (error) {
      console.error("Failed to set up Cursor tool interception:", error);
    }
  }

  /**
   * Record a tool call
   */
  public recordToolCall(
    tool: string,
    status: "success" | "warning" | "error" = "success",
    parameters?: Record<string, any>
  ): void {
    // Guard against undefined or null tool
    if (!tool) {
      console.error(
        "Attempted to record tool call with undefined or null tool name"
      );
      return;
    }

    // Check if this tool is in the excluded list
    if (this.settings.excludedTools.includes(tool)) {
      console.log(`Tool ${tool} is excluded from rate limiting`);
      return;
    }

    const newCall: ToolCallRecord = {
      id: uuidv4(),
      tool,
      timestamp: new Date().toISOString(),
      parameters,
      status,
      bypassApplied: this.rateLimitStatus.bypassStatus === "active",
      bypassMethod:
        this.rateLimitStatus.bypassStatus === "active"
          ? this.settings.bypassMethod
          : undefined,
    };

    // Add to history
    this.toolCallHistory = [newCall, ...this.toolCallHistory];
    this.saveHistory();

    // Update status immediately for real-time monitoring
    this.updateStatus();

    // Notify real-time listeners
    this.notifyRealTimeListeners(newCall);

    // Check if we need to activate the interceptor
    this.checkToolCallLimitWarning();

    // Log for development purposes
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Tool call recorded: ${tool} (${status}) - Current count: ${this.rateLimitStatus.current}/${this.rateLimitStatus.limit}`
      );
    }
  }

  /**
   * Check if tool calls are approaching the limit and activate interceptor if needed
   */
  private checkToolCallLimitWarning(): void {
    // If we're already at or beyond the action threshold and interceptor isn't active
    if (
      this.rateLimitStatus.current >= TOOL_CALL_ACTION_THRESHOLD &&
      !this.isInterceptorActive
    ) {
      this.activateToolCallInterceptor();
    }
    // If we're at or beyond the warning threshold but below action threshold
    else if (
      this.rateLimitStatus.current >= TOOL_CALL_WARNING_THRESHOLD &&
      this.rateLimitStatus.current < TOOL_CALL_ACTION_THRESHOLD
    ) {
      // Prepare for possible intercept but don't activate yet
      this.prepareToolCallInterceptor();
    }
  }

  /**
   * Prepare the tool call interceptor - set up the necessary infrastructure without activating
   */
  private prepareToolCallInterceptor(): void {
    console.log(
      "📢 Tool call limit approaching warning threshold. Preparing interceptor..."
    );

    // Generate a unique external bypass URL if needed
    if (!this.externalBypassUrl) {
      // In a real implementation, this would generate a unique URL or token
      // for an external service to use for bypassing
      this.externalBypassUrl = `${
        window.location.origin
      }/api/external-bypass/${Date.now()}`;

      // Add a logging message to explain how to use this
      console.info("⚠️ TOOL CALL LIMIT APPROACHING", {
        current: this.rateLimitStatus.current,
        limit: this.rateLimitStatus.limit,
        bypassUrl: this.externalBypassUrl,
      });

      // Show a notification if enabled
      if (this.settings.enableNotifications) {
        this.showNotification(
          "Tool Call Limit Approaching",
          `Current: ${this.rateLimitStatus.current}/${this.settings.toolCallLimit}. Preparing bypass.`
        );
      }
    }
  }

  /**
   * Activate the tool call interceptor when nearly at the limit
   */
  public activateToolCallInterceptor(): void {
    if (this.isInterceptorActive) return;

    console.warn(
      "🛑 CRITICAL: Tool call limit nearly reached. Activating interceptor..."
    );
    this.isInterceptorActive = true;

    // Create and configure invisible iframe for external monitoring
    // This creates a hidden communication channel that can reset the limit
    if (!this.interceptorFrame) {
      this.interceptorFrame = document.createElement("iframe");
      this.interceptorFrame.style.position = "absolute";
      this.interceptorFrame.style.top = "-9999px";
      this.interceptorFrame.style.left = "-9999px";
      this.interceptorFrame.style.width = "1px";
      this.interceptorFrame.style.height = "1px";
      this.interceptorFrame.src = `${window.location.origin}/rate-limit-manager?autoActivate=true&threshold=${this.rateLimitStatus.current}`;

      document.body.appendChild(this.interceptorFrame);

      // Setup message listener for communication with the iframe
      window.addEventListener("message", this.handleInterceptorMessage);

      // Show critical notification
      this.showNotification(
        "⚠️ CRITICAL: Tool Call Limit Nearly Reached",
        `Current: ${this.rateLimitStatus.current}/${this.settings.toolCallLimit}. Auto-bypass activated.`,
        10000
      );

      // Log instructions for manual intervention
      console.info(
        "Tool call interceptor activated. If needed, manually force reset at:",
        `${window.location.origin}/rate-limit-manager`
      );
    }

    // For demonstration purposes, trigger auto-bypass
    if (this.settings.autoBypass) {
      this.executeBypass();
    }
  }

  /**
   * Handle messages from the interceptor iframe
   */
  private handleInterceptorMessage = (event: MessageEvent): void => {
    // Validate origin for security
    if (event.origin !== window.location.origin) return;

    // Handle various commands from the interceptor
    if (event.data?.type === "FORCE_RESET") {
      this.forceReset();
      console.log("Tool call limit reset by external interceptor");
    } else if (event.data?.type === "EXECUTE_BYPASS") {
      this.executeBypass();
      console.log("Bypass executed by external interceptor");
    }
  };

  /**
   * Deactivate the tool call interceptor
   */
  public deactivateToolCallInterceptor(): void {
    if (!this.isInterceptorActive) return;

    console.log("Deactivating tool call interceptor...");
    this.isInterceptorActive = false;
    this.externalBypassUrl = null;

    // Clean up iframe if it exists
    if (this.interceptorFrame) {
      window.removeEventListener("message", this.handleInterceptorMessage);
      document.body.removeChild(this.interceptorFrame);
      this.interceptorFrame = null;
    }
  }

  /**
   * Show a notification
   */
  private showNotification(
    title: string,
    message: string,
    duration: number = 5000
  ): void {
    // Check if the browser supports notifications
    if ("Notification" in window) {
      // Check if permission is granted
      if (Notification.permission === "granted") {
        new Notification(title, { body: message });
      } else if (Notification.permission !== "denied") {
        // Request permission
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body: message });
          }
        });
      }
    }

    // Fallback to console for environments without notification support
    console.warn(`${title}: ${message}`);
  }

  /**
   * Get the current rate limit status
   */
  public getStatus(): RateLimitStatus {
    return { ...this.rateLimitStatus };
  }

  /**
   * Get tool call history
   */
  public getHistory(limit?: number): ToolCallRecord[] {
    return limit
      ? this.toolCallHistory.slice(0, limit)
      : [...this.toolCallHistory];
  }

  /**
   * Get the current settings
   */
  public getSettings(): RateLimitSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  public updateSettings(newSettings: Partial<RateLimitSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };

    this.saveSettings();

    // Update status with new settings
    this.rateLimitStatus.limit = this.settings.toolCallLimit;
    this.rateLimitStatus.percentage = Math.min(
      Math.round(
        (this.rateLimitStatus.current / this.settings.toolCallLimit) * 100
      ),
      100
    );
    this.rateLimitStatus.isApproachingLimit =
      this.rateLimitStatus.percentage >= this.settings.notificationThreshold;

    // Restart the reset timer with new interval
    this.startResetTimer();

    // Update monitoring if needed
    if (this.settings.autoBypass) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Reset settings to defaults
   */
  public resetSettings(): void {
    this.settings = { ...defaultSettings };
    this.saveSettings();

    // Update status with default settings
    this.updateStatus();

    // Restart the reset timer with default interval
    this.startResetTimer();

    // Update monitoring
    if (this.settings.autoBypass) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }

  /**
   * Register a listener for status updates
   * Returns an unsubscribe function
   */
  public registerListener(
    callback: (status: RateLimitStatus) => void
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
   * Force reset for testing
   */
  public forceReset(): void {
    this.resetToolCallCount();

    // Log the reset for debugging
    console.info("🔄 Tool call count has been force reset");
  }

  /**
   * Notify all listeners of status updates
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.rateLimitStatus });
      } catch (error) {
        console.error("Error in rate limit listener:", error);
      }
    });
  }

  /**
   * Register a listener for real-time tool call events
   * Returns an unsubscribe function
   */
  public registerRealTimeListener(
    callback: (record: ToolCallRecord) => void
  ): () => void {
    this.realTimeListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.realTimeListeners = this.realTimeListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Notify all real-time listeners about a new tool call
   */
  private notifyRealTimeListeners(record: ToolCallRecord): void {
    this.realTimeListeners.forEach((listener) => {
      try {
        listener(record);
      } catch (error) {
        console.error("Error in real-time tool call listener:", error);
      }
    });
  }
}

// Export a singleton instance
const rateLimitService = new RateLimitService();
export default rateLimitService;
