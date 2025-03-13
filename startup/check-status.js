#!/usr/bin/env node

/**
 * OSPAiN₂ Ecosystem Status Check
 *
 * This script checks the status of all servers in the OSPAiN₂ ecosystem
 * including the OSPAiN₂ server, the Knowledge Graph server, and the MCP server.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");

// Configuration
const servers = [
  {
    name: "OSPAiN₂ Server",
    host: "localhost",
    port: 3001,
    endpoint: "/api/health",
    timeout: 5000,
  },
  {
    name: "Knowledge Graph Server",
    host: "localhost",
    port: 3005,
    endpoint: "/health",
    timeout: 5000,
  },
  {
    name: "MCP Server",
    host: "localhost",
    port: 3000,
    endpoint: "/health",
    timeout: 5000,
    processCheck: {
      command:
        process.platform === "win32"
          ? 'tasklist /fi "imagename eq python.exe" /fo csv /nh | findstr "mcp_server.py"'
          : 'ps aux | grep "[p]ython.*mcp_server.py"',
      exists: (output) => output.length > 0,
    },
  },
];

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path
const logFile = path.join(logsDir, "status-check.log");

/**
 * Log a message to console and file
 * @param {string} message - The message to log
 * @param {string} level - Log level (info, error, success)
 */
function log(message, level = "info") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  // Log to console with colors
  let consoleMessage;
  switch (level) {
    case "error":
      consoleMessage = `${colors.red}${message}${colors.reset}`;
      break;
    case "success":
      consoleMessage = `${colors.green}${message}${colors.reset}`;
      break;
    case "warning":
      consoleMessage = `${colors.yellow}${message}${colors.reset}`;
      break;
    default:
      consoleMessage = message;
  }
  console.log(consoleMessage);

  // Log to file
  fs.appendFileSync(logFile, logMessage + os.EOL);
}

/**
 * Check if a server is running
 * @param {Object} server - Server configuration
 * @returns {Promise<boolean>} - True if server is running
 */
function checkServer(server) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: server.host,
        port: server.port,
        path: server.endpoint,
        method: "GET",
        timeout: server.timeout,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            log(
              `${server.name} is running (Status: ${res.statusCode})`,
              "success"
            );
            try {
              const responseData = JSON.parse(data);
              if (responseData && typeof responseData === "object") {
                log(
                  `${server.name} details: ${JSON.stringify(
                    responseData,
                    null,
                    2
                  )}`
                );
              }
            } catch (e) {
              // Not JSON or invalid JSON, just log the raw response
              if (data && data.trim()) {
                log(`${server.name} response: ${data.trim()}`);
              }
            }
            resolve(true);
          } else {
            log(
              `${server.name} returned status code ${res.statusCode}`,
              "warning"
            );
            if (server.processCheck) {
              // Fallback to process check
              checkProcess(server).then(resolve);
            } else {
              resolve(false);
            }
          }
        });
      }
    );

    req.on("error", (err) => {
      log(`${server.name} HTTP check failed: ${err.message}`, "error");
      if (server.processCheck) {
        // Fallback to process check
        checkProcess(server).then(resolve);
      } else {
        resolve(false);
      }
    });

    req.on("timeout", () => {
      log(
        `${server.name} request timed out after ${server.timeout}ms`,
        "error"
      );
      req.destroy();
      if (server.processCheck) {
        // Fallback to process check
        checkProcess(server).then(resolve);
      } else {
        resolve(false);
      }
    });

    req.end();
  });
}

/**
 * Check if a process is running using command line
 * @param {Object} server - Server configuration
 * @returns {Promise<boolean>} - True if process is running
 */
function checkProcess(server) {
  return new Promise((resolve) => {
    if (!server.processCheck) {
      resolve(false);
      return;
    }

    exec(server.processCheck.command, (error, stdout, stderr) => {
      const output = stdout.toString().trim();
      const isRunning = server.processCheck.exists(output);

      if (isRunning) {
        log(
          `${server.name} process is running (detected via command line)`,
          "success"
        );
        resolve(true);
      } else {
        log(`${server.name} process was not found`, "error");
        resolve(false);
      }
    });
  });
}

/**
 * Check the status of all servers
 */
async function checkAllServers() {
  log(`${colors.cyan}=========================================${colors.reset}`);
  log(`${colors.cyan}  OSPAiN₂ Ecosystem Status Check        ${colors.reset}`);
  log(`${colors.cyan}=========================================${colors.reset}`);
  log("");

  const results = [];

  for (const server of servers) {
    const isRunning = await checkServer(server);
    results.push({ server: server.name, running: isRunning });
  }

  log("");
  log(`${colors.cyan}=========================================${colors.reset}`);
  log(`${colors.cyan}  Summary                               ${colors.reset}`);
  log(`${colors.cyan}=========================================${colors.reset}`);

  const allRunning = results.every((r) => r.running);

  for (const result of results) {
    if (result.running) {
      log(`✅ ${result.server} is running`, "success");
    } else {
      log(`❌ ${result.server} is not running`, "error");
    }
  }

  log("");
  if (allRunning) {
    log("All servers are running correctly! 🎉", "success");
  } else {
    log("Some servers are not running. Check the logs for details.", "warning");

    // Provide startup suggestions for servers that aren't running
    log("");
    log(
      `${colors.cyan}  Startup Commands                      ${colors.reset}`
    );
    log(
      `${colors.cyan}=========================================${colors.reset}`
    );

    for (const result of results) {
      if (!result.running) {
        if (result.server === "OSPAiN₂ Server") {
          log(
            `To start OSPAiN₂ Server: ${colors.green}startup/ospain2-startup.sh${colors.reset} or ${colors.green}startup\\ospain2-startup.bat${colors.reset}`
          );
        } else if (result.server === "Knowledge Graph Server") {
          log(
            `To start Knowledge Graph Server: ${colors.green}startup/knowledge-graph-startup.sh${colors.reset} or ${colors.green}startup\\knowledge-graph-startup.bat${colors.reset}`
          );
        } else if (result.server === "MCP Server") {
          log(
            `To start MCP Server: ${colors.green}startup/mcp-server-startup.sh${colors.reset} or ${colors.green}startup\\mcp-server-startup.bat${colors.reset}`
          );
        }
      }
    }

    log("");
    log(
      `To start all servers: ${colors.green}startup/start-all.sh${colors.reset} or ${colors.green}startup\\start-all.bat${colors.reset}`
    );
  }
}

// Run the status check
checkAllServers().catch((err) => {
  log(`Error running status check: ${err.message}`, "error");
  process.exit(1);
});
