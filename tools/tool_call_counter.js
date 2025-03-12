/**
 * Tool Call Counter
 *
 * A simple utility to track and manage Cursor IDE tool call usage to prevent rate-limit errors.
 * This counter helps detect when we're approaching the 25-tool call limit and provides
 * functionality to trigger preventative actions before errors occur.
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Configuration
const CONFIG = {
  maxToolCalls: 25,
  warningThreshold: 20, // Trigger warning at this number of calls
  counterFile: path.join(__dirname, "../logs/tool_call_count.json"),
  resetOnExceeded: true,
  logEnabled: true,
};

// Ensure logs directory exists
const logsDir = path.dirname(CONFIG.counterFile);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Default counter state
const defaultState = {
  count: 0,
  lastReset: new Date().toISOString(),
  history: [],
};

/**
 * Get the current counter state
 * @returns {Object} The current counter state
 */
function getCounterState() {
  try {
    if (fs.existsSync(CONFIG.counterFile)) {
      const data = fs.readFileSync(CONFIG.counterFile, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading counter file:", error);
  }
  return { ...defaultState };
}

/**
 * Save the counter state to file
 * @param {Object} state The state to save
 */
function saveCounterState(state) {
  try {
    fs.writeFileSync(CONFIG.counterFile, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error("Error saving counter state:", error);
  }
}

/**
 * Increment the tool call counter
 * @param {string} toolName The name of the tool being called
 * @returns {Object} Updated counter state with warning status
 */
function incrementCounter(toolName = "unknown") {
  const state = getCounterState();
  state.count++;

  // Record the tool call in history
  state.history.push({
    tool: toolName,
    timestamp: new Date().toISOString(),
    count: state.count,
  });

  // Keep history from growing too large
  if (state.history.length > 100) {
    state.history = state.history.slice(-100);
  }

  // Check if we're approaching the limit
  const isApproachingLimit = state.count >= CONFIG.warningThreshold;
  const hasExceededLimit = state.count >= CONFIG.maxToolCalls;

  // Log counter status
  if (CONFIG.logEnabled) {
    console.log(
      `Tool call count: ${state.count}/${CONFIG.maxToolCalls} (${toolName})`
    );

    if (isApproachingLimit && !hasExceededLimit) {
      console.warn(
        `⚠️ WARNING: Approaching tool call limit (${state.count}/${CONFIG.maxToolCalls})`
      );
    }

    if (hasExceededLimit) {
      console.error(
        `🚫 ERROR: Tool call limit exceeded (${state.count}/${CONFIG.maxToolCalls})`
      );

      if (CONFIG.resetOnExceeded) {
        resetCounter();
        return {
          ...getCounterState(),
          warning: true,
          exceeded: true,
          reset: true,
        };
      }
    }
  }

  saveCounterState(state);
  return { ...state, warning: isApproachingLimit, exceeded: hasExceededLimit };
}

/**
 * Reset the tool call counter
 */
function resetCounter() {
  const state = getCounterState();
  const oldCount = state.count;

  // Keep the history but reset the count
  state.count = 0;
  state.lastReset = new Date().toISOString();
  state.history.push({
    tool: "reset",
    timestamp: state.lastReset,
    oldCount: oldCount,
    count: 0,
  });

  saveCounterState(state);

  if (CONFIG.logEnabled) {
    console.log(`Counter reset from ${oldCount} to 0`);
  }

  return state;
}

/**
 * Simulate a rate-limit error for testing
 * @returns {boolean} Success status
 */
function simulateRateLimitError() {
  // Set the counter to just below max to trigger warning
  const state = getCounterState();
  state.count = CONFIG.maxToolCalls - 1;
  saveCounterState(state);

  console.log(
    `🧪 Simulating approaching rate limit (${state.count}/${CONFIG.maxToolCalls})`
  );
  return true;
}

/**
 * Get statistics about tool usage
 * @returns {Object} Usage statistics
 */
function getUsageStats() {
  const state = getCounterState();

  // Create a summary of tool usage
  const toolCounts = {};
  state.history.forEach((entry) => {
    if (entry.tool !== "reset") {
      toolCounts[entry.tool] = (toolCounts[entry.tool] || 0) + 1;
    }
  });

  // Sort tools by usage
  const sortedTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => ({ tool, count }));

  return {
    currentCount: state.count,
    maxToolCalls: CONFIG.maxToolCalls,
    warningThreshold: CONFIG.warningThreshold,
    lastReset: state.lastReset,
    toolUsage: sortedTools,
    historySize: state.history.length,
  };
}

// Export functions for use in other files
module.exports = {
  incrementCounter,
  resetCounter,
  getCounterState,
  simulateRateLimitError,
  getUsageStats,
};

// If run directly, show usage stats
if (require.main === module) {
  console.log("Tool Call Counter Status:");
  console.log(JSON.stringify(getUsageStats(), null, 2));
}
