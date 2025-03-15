'use strict';
/**
 * RateLimitBypassService
 *
 * A service that handles tool call rate limit monitoring and bypass methods.
 * This is a crucial part of the OSPAiN₂ ecosystem to ensure uninterrupted
 * AI assistant functionality.
 */
Object.defineProperty(exports, '__esModule', { value: true });
// Default settings
const defaultSettings = {
  autoBypass: true,
  bypassMethod: 'session-rotation',
  notificationThreshold: 75,
  enableNotifications: true,
  monitorInterval: 30,
  excludedTools: ['web_search', 'diff_history'],
  customBypassRules: '',
};
class RateLimitBypassService {
  constructor() {
    this.toolCallHistory = [];
    this.toolCallStatus = {
      current: 0,
      limit: 25,
      percentage: 0,
      bypassStatus: 'inactive',
      nextReset: '--:--:--',
    };
    this.monitoringInterval = null;
    this.listeners = [];
    // Load settings from localStorage or use defaults
    this.settings = this.loadSettings();
    this.loadHistory();
    // Initialize with some sample data for demo purposes
    this.toolCallStatus = {
      current: 12,
      limit: 25,
      percentage: 48,
      bypassStatus: 'inactive',
      nextReset: '1:30:00',
      currentMethod: this.settings.bypassMethod,
    };
    // Start monitoring if auto-bypass is enabled
    if (this.settings.autoBypass) {
      this.startMonitoring();
    }
  }
  /**
   * Load settings from localStorage or return defaults
   */
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('rateLimitBypassSettings');
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error('Error loading rate limit bypass settings:', error);
      return defaultSettings;
    }
  }
  /**
   * Load tool call history from localStorage
   */
  loadHistory() {
    try {
      const savedHistory = localStorage.getItem('toolCallHistory');
      this.toolCallHistory = savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading tool call history:', error);
      this.toolCallHistory = [];
    }
  }
  /**
   * Start monitoring tool calls for rate limit
   */
  startMonitoring() {
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
        this.toolCallStatus.bypassStatus !== 'active'
      ) {
        this.executeBypass();
      }
    }, this.settings.monitorInterval * 1000);
  }
  /**
   * Stop monitoring tool calls
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  /**
   * Update the current tool call status
   */
  updateStatus() {
    // In a real app, this would query the current state
    // from an API or other source
    // For demo, randomly increase usage sometimes
    if (Math.random() > 0.7) {
      this.toolCallStatus.current = Math.min(
        this.toolCallStatus.current + 1,
        this.toolCallStatus.limit,
      );
      this.toolCallStatus.percentage = Math.min(
        Math.floor((this.toolCallStatus.current / this.toolCallStatus.limit) * 100),
        100,
      );
    }
    // Update reset time
    const now = new Date();
    const resetHour = now.getHours() + 1;
    const resetMin = now.getMinutes();
    this.toolCallStatus.nextReset = `${resetHour}:${resetMin < 10 ? '0' + resetMin : resetMin}:00`;
    // Notify listeners of the status update
    this.notifyListeners();
  }
  /**
   * Execute the appropriate bypass method
   */
  executeBypass() {
    console.log(`Executing bypass using method: ${this.settings.bypassMethod}`);
    this.toolCallStatus.bypassStatus = 'pending';
    this.notifyListeners();
    // Simulate method execution with a delay
    setTimeout(() => {
      // Update status to show bypass is active
      this.toolCallStatus.bypassStatus = 'active';
      // Reset counter for demo purposes
      this.toolCallStatus.current = 0;
      this.toolCallStatus.percentage = 0;
      this.notifyListeners();
      // Set a timeout to deactivate the bypass after a while
      setTimeout(() => {
        this.toolCallStatus.bypassStatus = 'inactive';
        this.notifyListeners();
      }, 60000);
    }, 1500);
  }
  /**
   * Get the current tool call status
   */
  getStatus() {
    return this.toolCallStatus;
  }
  /**
   * Register a listener for status updates
   * @param callback Function to call when status changes
   * @returns Function to unregister the listener
   */
  registerListener(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }
  /**
   * Notify all listeners of a status change
   */
  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.toolCallStatus);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }
}
// Export a singleton instance
const rateLimitBypassService = new RateLimitBypassService();
exports.default = rateLimitBypassService;
//# sourceMappingURL=RateLimitBypassService.js.map
