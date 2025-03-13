/**
 * Knowledge Graph Server Health Check
 *
 * This script checks if the Knowledge Graph server is running
 * and responds to API requests properly.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Configuration
const config = {
  host: "localhost",
  port: 3004, // Default Knowledge Graph server port
  endpoint: "/api/health",
  timeout: 5000,
  autoRestart: true,
  logFile: path.join(__dirname, "..", "logs", "knowledge-graph-health.log"),
  pidFile: path.join(__dirname, "..", "data", "knowledge-graph.pid"),
  startScript:
    process.platform === "win32"
      ? path.join(__dirname, "knowledge-graph-startup.bat")
      : path.join(__dirname, "knowledge-graph-startup.sh"),
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
  log("Performing Knowledge Graph server health check...");

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
          log("Knowledge Graph server is healthy. Status: 200 OK");
        } else {
          log(`Knowledge Graph server returned status: ${res.statusCode}`);
          if (config.autoRestart) {
            restartServer();
          }
        }
      });
    }
  );

  req.on("error", (err) => {
    log(`Error connecting to Knowledge Graph server: ${err.message}`);
    if (config.autoRestart) {
      restartServer();
    }
  });

  req.on("timeout", () => {
    req.destroy();
    log("Connection to Knowledge Graph server timed out");
    if (config.autoRestart) {
      restartServer();
    }
  });

  req.end();
}

// Function to check if server process is running
function isProcessRunning() {
  if (!fs.existsSync(config.pidFile)) {
    log("PID file not found. Server may not be running.");
    return false;
  }

  let pid;
  try {
    // Windows might store the window title instead of a PID
    const pidContent = fs.readFileSync(config.pidFile, "utf8").trim();
    if (isNaN(pidContent)) {
      // On Windows, check if we have a node process running with memory-path
      if (process.platform === "win32") {
        const checkCmd = spawn("tasklist", [
          "/fi",
          "imagename eq node.exe",
          "/fo",
          "csv",
          "/nh",
        ]);
        const grepCmd = spawn("findstr", ["memory-path"]);

        checkCmd.stdout.pipe(grepCmd.stdin);

        return new Promise((resolve) => {
          grepCmd.stdout.on("data", (data) => {
            if (data.toString().length > 0) {
              resolve(true);
            }
          });

          grepCmd.on("close", (code) => {
            resolve(code === 0);
          });
        });
      }
      return false;
    }

    pid = parseInt(pidContent, 10);

    // Check if process is running
    if (process.platform === "win32") {
      const result = spawn("tasklist", [
        "/fi",
        `pid eq ${pid}`,
        "/fo",
        "csv",
        "/nh",
      ]);
      return new Promise((resolve) => {
        result.stdout.on("data", (data) => {
          resolve(data.toString().includes(pid.toString()));
        });

        result.on("close", (code) => {
          resolve(false);
        });
      });
    } else {
      try {
        // For Unix-like systems, kill -0 doesn't kill the process but checks if it exists
        process.kill(pid, 0);
        return true;
      } catch (e) {
        return false;
      }
    }
  } catch (err) {
    log(`Error checking PID file: ${err.message}`);
    return false;
  }
}

// Function to restart the server
function restartServer() {
  log("Attempting to restart Knowledge Graph server...");

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

// Make the health check immediately runnable
if (require.main === module) {
  checkHealth();
}

// Export functions for use in other scripts
module.exports = {
  checkHealth,
  isProcessRunning,
  restartServer,
  config,
};
