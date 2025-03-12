#!/usr/bin/env node
/**
 * Tool Call Counter CLI
 *
 * Command-line interface for managing the tool call counter.
 * Use this script to check the current count, reset the counter,
 * simulate rate-limit scenarios, and view usage statistics.
 */

const {
  incrementCounter,
  resetCounter,
  getCounterState,
  simulateRateLimitError,
  getUsageStats,
} = require("./tool_call_counter");

const COMMANDS = {
  status: {
    description: "Show current counter status",
    handler: showStatus,
  },
  increment: {
    description: "Increment the counter",
    handler: (args) => incrementWithName(args[0]),
  },
  reset: {
    description: "Reset the counter to zero",
    handler: resetAndShow,
  },
  simulate: {
    description: "Simulate approaching the rate limit",
    handler: simulateLimit,
  },
  stats: {
    description: "Show detailed usage statistics",
    handler: showStats,
  },
  help: {
    description: "Show this help menu",
    handler: showHelp,
  },
};

/**
 * Parse and process command line arguments
 */
function processArgs() {
  const args = process.argv.slice(2);
  const command = args.shift() || "status";

  if (COMMANDS[command]) {
    COMMANDS[command].handler(args);
  } else {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
}

/**
 * Show the current counter status
 */
function showStatus() {
  const state = getCounterState();
  const percent = Math.round((state.count / 25) * 100);

  console.log("\n📊 Tool Call Counter Status:");
  console.log("======================================");
  console.log(`Current count: ${state.count}/25 (${percent}%)`);

  // Display a visual progress bar
  const barWidth = 30;
  const filled = Math.round((state.count / 25) * barWidth);
  const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);

  let statusColor = "\x1b[32m"; // Green
  if (state.count >= 20) statusColor = "\x1b[31m"; // Red
  else if (state.count >= 15) statusColor = "\x1b[33m"; // Yellow

  console.log(`\n${statusColor}${bar}\x1b[0m`);

  // Show warnings if appropriate
  if (state.count >= 20) {
    console.log("\n⚠️  \x1b[31mWARNING: Approaching tool call limit!\x1b[0m");
  }

  console.log(
    `\nLast reset: ${new Date(
      state.count === 0 ? state.lastReset : state.history[0].timestamp
    ).toLocaleString()}`
  );
  console.log("======================================\n");
}

/**
 * Increment the counter with a specific tool name
 */
function incrementWithName(toolName = "cli") {
  const result = incrementCounter(toolName);
  console.log(`✅ Counter incremented to ${result.count}/25`);

  if (result.warning) {
    console.log("⚠️  \x1b[33mWARNING: Approaching tool call limit!\x1b[0m");
  }

  if (result.exceeded) {
    console.log("🚫 \x1b[31mERROR: Tool call limit exceeded!\x1b[0m");
    if (result.reset) {
      console.log("🔄 Counter has been automatically reset");
    }
  }
}

/**
 * Reset the counter and show the new status
 */
function resetAndShow() {
  const result = resetCounter();
  console.log(`🔄 Counter reset from previous value to ${result.count}`);
  showStatus();
}

/**
 * Simulate approaching the rate limit
 */
function simulateLimit() {
  simulateRateLimitError();
  console.log("🧪 Simulated approaching the rate limit");
  showStatus();
}

/**
 * Show detailed usage statistics
 */
function showStats() {
  const stats = getUsageStats();

  console.log("\n📈 Tool Call Usage Statistics:");
  console.log("======================================");
  console.log(`Current count: ${stats.currentCount}/${stats.maxToolCalls}`);
  console.log(`Warning threshold: ${stats.warningThreshold}`);
  console.log(`Last reset: ${new Date(stats.lastReset).toLocaleString()}`);
  console.log(`History size: ${stats.historySize} entries`);

  if (stats.toolUsage.length > 0) {
    console.log("\nTool Usage Breakdown:");
    stats.toolUsage.forEach(({ tool, count }) => {
      console.log(`  - ${tool}: ${count} calls`);
    });
  } else {
    console.log("\nNo tool usage recorded yet");
  }

  console.log("======================================\n");
}

/**
 * Show help menu
 */
function showHelp() {
  console.log("\n🔧 Tool Call Counter CLI - Help");
  console.log("======================================");
  console.log("Usage: node tool_counter_cli.js [command] [args]\n");
  console.log("Available commands:");

  Object.entries(COMMANDS).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(10)} - ${info.description}`);
  });

  console.log("\nExamples:");
  console.log(
    "  node tool_counter_cli.js                  - Show current status"
  );
  console.log(
    '  node tool_counter_cli.js increment api    - Increment counter for "api" tool'
  );
  console.log(
    "  node tool_counter_cli.js reset            - Reset the counter"
  );
  console.log(
    "  node tool_counter_cli.js stats            - Show detailed statistics"
  );
  console.log("======================================\n");
}

// Run the CLI
processArgs();
