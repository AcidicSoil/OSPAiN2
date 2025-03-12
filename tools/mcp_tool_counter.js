/**
 * MCP Tool Call Counter Integration
 *
 * This module integrates the tool call counter with the MCP framework,
 * allowing for automatic tracking of tool calls and triggering preventative
 * actions when approaching the rate limit.
 */

const path = require("path");
const fs = require("fs");
const {
  incrementCounter,
  resetCounter,
  getCounterState,
  simulateRateLimitError,
  getUsageStats,
} = require("./tool_call_counter");

// Screenshot analysis integration
let screenshotModule;
try {
  screenshotModule = require("./screenshot_analyzer");
} catch (err) {
  // Screenshot module not available, will use fallback approach
  screenshotModule = null;
}

// RobotJS integration for mouse control
let robotModule;
try {
  robotModule = require("robotjs");
} catch (err) {
  // RobotJS not available, will use fallback approach
  robotModule = null;
}

// Configuration
const CONFIG = {
  enabled: true,
  trackAllTools: true,
  autoResetEnabled: true,
  warningThreshold: 20,
  maxToolCalls: 25,
  screenshotEnabled: !!screenshotModule,
  mouseControlEnabled: !!robotModule,
  logToFile: true,
  logFilePath: path.join(__dirname, "../logs/mcp_counter.log"),
};

// Ensure logs directory exists
const logsDir = path.dirname(CONFIG.logFilePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Write a message to the log file
 * @param {string} message The message to log
 */
function logToFile(message) {
  if (!CONFIG.logToFile) return;

  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  try {
    fs.appendFileSync(CONFIG.logFilePath, logEntry);
  } catch (error) {
    console.error("Error writing to log file:", error);
  }
}

/**
 * Track a tool call with the counter
 * @param {string} toolName Name of the tool being called
 * @param {Object} options Additional options
 * @returns {Object} Counter result with warning status
 */
function trackToolCall(toolName, options = {}) {
  if (!CONFIG.enabled) return { count: 0, warning: false, exceeded: false };

  const result = incrementCounter(toolName);

  if (result.warning) {
    handleWarningState(result, toolName);
  }

  if (result.exceeded) {
    handleExceededState(result, toolName);
  }

  // Log the tool call
  logToFile(
    `Tool call tracked: ${toolName} (Count: ${result.count}/${CONFIG.maxToolCalls})`
  );

  return result;
}

/**
 * Handle the warning state (approaching limit)
 * @param {Object} result Counter result
 * @param {string} toolName Name of the tool being called
 */
function handleWarningState(result, toolName) {
  console.warn(
    `⚠️ WARNING: Approaching tool call limit (${result.count}/${CONFIG.maxToolCalls})`
  );
  logToFile(
    `WARNING: Approaching tool call limit (${result.count}/${CONFIG.maxToolCalls})`
  );

  // Notify the user
  if (result.count === CONFIG.warningThreshold) {
    const warningMessage = `
    ⚠️ APPROACHING TOOL CALL LIMIT ⚠️
    Current count: ${result.count}/${CONFIG.maxToolCalls}
    
    Preventative measures will be taken if the limit is reached.
    Consider completing the current task and starting a new session.
    `;

    console.warn(warningMessage);
    logToFile(
      `Warning notification sent to user: ${result.count}/${CONFIG.maxToolCalls}`
    );
  }

  // Attempt to take a screenshot if enabled and we're close to the limit
  if (CONFIG.screenshotEnabled && result.count >= CONFIG.warningThreshold + 2) {
    attemptScreenshotAnalysis();
  }
}

/**
 * Handle the exceeded state (reached limit)
 * @param {Object} result Counter result
 * @param {string} toolName Name of the tool being called
 */
function handleExceededState(result, toolName) {
  console.error(
    `🚫 ERROR: Tool call limit exceeded (${result.count}/${CONFIG.maxToolCalls})`
  );
  logToFile(
    `ERROR: Tool call limit exceeded (${result.count}/${CONFIG.maxToolCalls})`
  );

  // Take automatic action if mouse control is enabled
  if (CONFIG.mouseControlEnabled) {
    attemptAutomatedRecovery();
  }

  // Reset counter if enabled
  if (CONFIG.autoResetEnabled) {
    resetCounter();
    logToFile("Counter automatically reset after exceeding limit");
  }
}

/**
 * Attempt to analyze a screenshot for rate-limit errors
 * @returns {boolean} Success status
 */
function attemptScreenshotAnalysis() {
  if (!screenshotModule) return false;

  try {
    logToFile("Attempting screenshot analysis for rate-limit detection");
    const result = screenshotModule.analyzeForRateLimitErrors();

    if (result.errorDetected) {
      logToFile(
        `Rate-limit error detected in screenshot: ${JSON.stringify(result)}`
      );

      if (CONFIG.mouseControlEnabled) {
        attemptAutomatedRecovery();
      }
    }

    return result.errorDetected;
  } catch (error) {
    logToFile(`Error during screenshot analysis: ${error.message}`);
    return false;
  }
}

/**
 * Attempt automated recovery using mouse control
 * @returns {boolean} Success status
 */
function attemptAutomatedRecovery() {
  if (!robotModule) return false;

  try {
    logToFile("Attempting automated recovery with mouse control");

    // Simple example of a mouse movement sequence
    // In a real implementation, this would use coordinates detected from screenshot analysis
    const screenSize = robotModule.getScreenSize();
    const centerX = screenSize.width / 2;
    const centerY = screenSize.height / 2;

    // Move to center of screen
    robotModule.moveMouse(centerX, centerY);

    // Wait a moment
    setTimeout(() => {
      // Click (would be on a specific button in real implementation)
      robotModule.mouseClick();

      logToFile("Automated recovery sequence completed");
    }, 500);

    return true;
  } catch (error) {
    logToFile(`Error during automated recovery: ${error.message}`);
    return false;
  }
}

/**
 * Reset the counter and log the action
 * @returns {Object} The reset counter state
 */
function resetToolCounter() {
  const result = resetCounter();
  logToFile(`Counter manually reset from UI`);
  return result;
}

/**
 * Patch the MCP server to automatically track all tool calls
 * @param {Object} mcpServer The MCP server instance to patch
 * @returns {boolean} Success status
 */
function patchMCPServer(mcpServer) {
  if (!mcpServer || !mcpServer.executeFunction) {
    console.error("Invalid MCP server instance provided for patching");
    return false;
  }

  // Store the original executeFunction method
  const originalExecute = mcpServer.executeFunction;

  // Replace with our tracking version
  mcpServer.executeFunction = function (functionName, params, ...args) {
    // Track the tool call
    trackToolCall(functionName, { params });

    // Call the original method
    return originalExecute.call(this, functionName, params, ...args);
  };

  logToFile("MCP server successfully patched for tool call tracking");
  return true;
}

/**
 * Get detailed status information about the counter
 * @returns {Object} Status information
 */
function getStatus() {
  const state = getCounterState();
  const stats = getUsageStats();

  return {
    enabled: CONFIG.enabled,
    count: state.count,
    maxToolCalls: CONFIG.maxToolCalls,
    warningThreshold: CONFIG.warningThreshold,
    isWarning: state.count >= CONFIG.warningThreshold,
    isExceeded: state.count >= CONFIG.maxToolCalls,
    screenshotEnabled: CONFIG.screenshotEnabled,
    mouseControlEnabled: CONFIG.mouseControlEnabled,
    autoResetEnabled: CONFIG.autoResetEnabled,
    lastReset: state.lastReset,
    toolUsage: stats.toolUsage.slice(0, 5), // Top 5 tools
  };
}

/**
 * Update configuration settings
 * @param {Object} newConfig New configuration settings
 * @returns {Object} Updated configuration
 */
function updateConfig(newConfig) {
  Object.assign(CONFIG, newConfig);
  logToFile(`Configuration updated: ${JSON.stringify(newConfig)}`);
  return { ...CONFIG };
}

// Export the module
module.exports = {
  trackToolCall,
  resetToolCounter,
  getStatus,
  updateConfig,
  patchMCPServer,
  simulateRateLimitError,
  attemptScreenshotAnalysis,
  attemptAutomatedRecovery,
};
