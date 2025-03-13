/**
 * MCP Server Health Check
 *
 * This script checks if the MCP server is running
 * and responds properly.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Configuration
const config = {
  host: "localhost",
  port: 3000, // Default MCP server port
  endpoint: "/health",
  timeout: 5000,
  autoRestart: true,
  logFile: path.join(__dirname, "..", "logs", "mcp-server-health.log"),
  pidFile: path.join(__dirname, "..", "data", "mcp-server.pid"),
  startScript:
    process.platform === "win32"
      ? path.join(__dirname, "mcp-server-startup.bat")
      : path.join(__dirname, "mcp-server-startup.sh"),
};

// Ensure log directory exists
const logDir = path.dirname(config.logFile);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Logger function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);

  fs.appendFileSync(config.logFile, logMessage);
}

// Health check function
function checkHealth() {
  log("Performing MCP server health check...");

  const req = http.request(
    {
      host: config.host,
      port: config.port,
      path: config.endpoint,
      method: "GET",
      timeout: config.timeout,
    },
    (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          log("MCP server is healthy. Status: 200 OK");
        } else {
          log(`MCP server returned status: ${res.statusCode}`);
          if (config.autoRestart) {
            restartServer();
          }
        }
      });
    }
  );

  req.on("error", (err) => {
    log(`Error connecting to MCP server: ${err.message}`);
    if (config.autoRestart) {
      restartServer();
    }
  });

  req.on("timeout", () => {
    req.destroy();
    log("Connection to MCP server timed out");
    if (config.autoRestart) {
      restartServer();
    }
  });

  req.end();
}

// Alternative health check - check if Python process is running
function checkProcessRunning() {
  log("Checking if MCP server process is running...");

  if (!fs.existsSync(config.pidFile)) {
    log("PID file not found. Server may not be running.");
    if (config.autoRestart) {
      restartServer();
    }
    return;
  }

  try {
    // On Windows, we might have stored the window title instead of a PID
    const pidContent = fs.readFileSync(config.pidFile, "utf8").trim();

    if (isNaN(pidContent)) {
      // On Windows, check if we have a python process running with mcp_server.py
      if (process.platform === "win32") {
        const checkCmd = spawn("tasklist", [
          "/fi",
          "imagename eq python.exe",
          "/fo",
          "csv",
          "/nh",
        ]);
        let output = "";

        checkCmd.stdout.on("data", (data) => {
          output += data.toString();
        });

        checkCmd.on("close", (code) => {
          if (code === 0 && output.includes("mcp_server.py")) {
            log("MCP server process is running.");
          } else {
            log("MCP server process is not running.");
            if (config.autoRestart) {
              restartServer();
            }
          }
        });
      } else {
        log("Cannot determine process status. PID file contains invalid data.");
        if (config.autoRestart) {
          restartServer();
        }
      }
    } else {
      // We have a numeric PID
      const pid = parseInt(pidContent, 10);

      // Check if process is running
      if (process.platform === "win32") {
        const checkCmd = spawn("tasklist", [
          "/fi",
          `pid eq ${pid}`,
          "/fo",
          "csv",
          "/nh",
        ]);
        let output = "";

        checkCmd.stdout.on("data", (data) => {
          output += data.toString();
        });

        checkCmd.on("close", (code) => {
          if (code === 0 && output.includes(pid.toString())) {
            log("MCP server process is running.");
          } else {
            log("MCP server process is not running.");
            if (config.autoRestart) {
              restartServer();
            }
          }
        });
      } else {
        try {
          // For Unix-like systems, kill -0 doesn't kill the process but checks if it exists
          process.kill(pid, 0);
          log("MCP server process is running.");
        } catch (e) {
          log("MCP server process is not running.");
          if (config.autoRestart) {
            restartServer();
          }
        }
      }
    }
  } catch (err) {
    log(`Error checking PID file: ${err.message}`);
    if (config.autoRestart) {
      restartServer();
    }
  }
}

// Function to restart the server
function restartServer() {
  log("Attempting to restart MCP server...");

  if (process.platform === "win32") {
    spawn("cmd.exe", ["/c", config.startScript], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } else {
    spawn("bash", [config.startScript], {
      detached: true,
      stdio: "ignore",
    }).unref();
  }

  log("Restart command issued. Waiting 10 seconds before next health check...");
  setTimeout(checkHealth, 10000);
}

// Run both checks
function runChecks() {
  // First try the HTTP health check
  try {
    checkHealth();
  } catch (err) {
    log(`HTTP health check failed: ${err.message}`);
    // Fall back to process check
    checkProcessRunning();
  }
}

// Make the health check immediately runnable
if (require.main === module) {
  runChecks();
}

// Export functions for use in other scripts
module.exports = {
  checkHealth,
  checkProcessRunning,
  restartServer,
  config,
};
