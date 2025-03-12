const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Configuration
const config = {
  ospain2ServerUrl: "http://localhost:3000", // Default Next.js port
  checkInterval: 30000, // 30 seconds
  restartAttempts: 3,
  restartDelay: 5000, // 5 seconds
  logPath: path.join(__dirname, "..", "logs", "health-check.log"),
  healthCheckPort: 3099, // Port for the health check server
};

// Ensure logs directory exists
const logsDir = path.dirname(config.logPath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(message);

  fs.appendFile(config.logPath, logMessage, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
}

// Health check function
function checkServerHealth() {
  log("Performing health check...");

  // Determine which protocol to use
  const requester = config.ospain2ServerUrl.startsWith("https") ? https : http;

  requester
    .get(config.ospain2ServerUrl, (res) => {
      const { statusCode } = res;

      if (statusCode >= 200 && statusCode < 300) {
        log(`Health check passed. Status code: ${statusCode}`);
        lastSuccessfulCheck = Date.now();
        consecutiveFailures = 0;
      } else {
        handleHealthCheckFailure(
          `Health check failed. Status code: ${statusCode}`
        );
      }
    })
    .on("error", (err) => {
      handleHealthCheckFailure(`Health check error: ${err.message}`);
    });
}

// Handle health check failure
let consecutiveFailures = 0;
let lastSuccessfulCheck = Date.now();
let isRestarting = false;

function handleHealthCheckFailure(errorMessage) {
  log(errorMessage);
  consecutiveFailures++;

  if (consecutiveFailures >= config.restartAttempts && !isRestarting) {
    isRestarting = true;
    log(
      `Server appears to be down. Attempting restart after ${
        config.restartDelay / 1000
      } seconds...`
    );

    setTimeout(() => {
      restartServer();
    }, config.restartDelay);
  }
}

// Restart the server
function restartServer() {
  log("Restarting OSPAiN2 server...");

  // Determine which startup script to use based on platform
  const isWindows = process.platform === "win32";
  const scriptPath = path.join(
    __dirname,
    isWindows ? "ospain2-startup.bat" : "ospain2-startup.sh"
  );

  exec(scriptPath, (error, stdout, stderr) => {
    if (error) {
      log(`Failed to restart server: ${error.message}`);
      log(stderr);
      isRestarting = false;
      return;
    }

    log("Restart command executed successfully");
    log(stdout);
    isRestarting = false;
    consecutiveFailures = 0;
  });
}

// Create health check status server
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    const timeSinceLastSuccess = Date.now() - lastSuccessfulCheck;
    const status = {
      status:
        consecutiveFailures >= config.restartAttempts ? "unhealthy" : "healthy",
      consecutiveFailures,
      lastSuccessfulCheck: new Date(lastSuccessfulCheck).toISOString(),
      timeSinceLastSuccessSec: Math.floor(timeSinceLastSuccess / 1000),
      isRestarting,
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(status, null, 2));
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

// Start the health check server
server.listen(config.healthCheckPort, () => {
  log(`Health check server listening on port ${config.healthCheckPort}`);
  log(
    `Health check status available at http://localhost:${config.healthCheckPort}/health`
  );
});

// Start periodic health checks
log("Starting OSPAiN2 health check monitoring...");
checkServerHealth(); // Initial check
setInterval(checkServerHealth, config.checkInterval);

// Handle process termination
process.on("SIGINT", () => {
  log("Health check service stopping...");
  server.close();
  process.exit(0);
});
