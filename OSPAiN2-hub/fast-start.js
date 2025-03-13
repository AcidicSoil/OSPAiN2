/**
 * Fast start script for OSPAiN2-hub
 *
 * This script starts the development server with optimized settings for faster refresh and debugging.
 */

const { spawn } = require("child_process");
const { resolve } = require("path");
const os = require("os");

// Calculate optimal memory based on system (up to 6GB but not more than 75% of system memory)
const systemMemoryGB = os.totalmem() / 1024 / 1024 / 1024;
const memoryLimit = Math.min(6, Math.floor(systemMemoryGB * 0.75));

console.log(`🚀 Starting OSPAiN2-hub with optimized settings:`);
console.log(`🧠 Memory limit: ${memoryLimit}GB`);
console.log(`⚡ Fast Refresh: Enabled`);
console.log(`🔄 Concurrent Mode: Enabled`);

// Set environment variables
const env = {
  ...process.env,
  NODE_OPTIONS: `--max-old-space-size=${memoryLimit * 1024}`,
  FAST_REFRESH: "true",
  REACT_APP_USE_CONCURRENT: "true",
  BROWSER: "none", // Prevents opening browser automatically
  TSC_COMPILE_ON_ERROR: "true", // Continue despite TypeScript errors
  ESLINT_NO_DEV_ERRORS: "true", // Show ESLint errors as warnings
};

// Start React application
const reactApp = spawn("react-scripts", ["start"], {
  env,
  stdio: "inherit",
  shell: true,
});

// Start API server
const apiServer = spawn("node", ["server.js"], {
  env,
  stdio: "inherit",
  shell: true,
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down development servers...");
  reactApp.kill("SIGINT");
  apiServer.kill("SIGINT");
  process.exit(0);
});

// Log any errors
reactApp.on("error", (err) => {
  console.error("❌ React app error:", err);
});

apiServer.on("error", (err) => {
  console.error("❌ API server error:", err);
});

console.log("📋 Press Ctrl+C to stop all servers");
