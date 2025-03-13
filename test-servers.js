const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const homedir = require("os").homedir();

// Load the MCP configuration
const mcpConfigPath = path.join(homedir, ".cursor", "mcp.json");
const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));

console.log("🔄 Testing MCP Servers...");
console.log("========================");

// Default ports for SSE servers
const DEFAULT_PORTS = {
  "knowledge-graph": 3004,
  "titan-memory": 3005,
  "repository-tools": 3006,
  "docker-integration": 3002,
  "mouse-automation": 3003,
  "prompt-engineering": 3001,
  "ollama-tag-cli": 3007,
  playwright: 3008,
  "browser-tools": 3009,
};

// Test if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

// Test SSE endpoint
async function testSSE(port, path = "/sse") {
  return new Promise((resolve) => {
    const req = http.request(
      {
        method: "GET",
        hostname: "localhost",
        port: port,
        path: path,
        headers: {
          Accept: "text/event-stream",
        },
      },
      (res) => {
        if (res.statusCode === 200) {
          resolve(true);
          res.destroy(); // Close the connection
        } else {
          resolve(false);
        }
      }
    );

    req.on("error", () => {
      resolve(false);
    });

    // Set timeout
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Run checks for all servers
async function checkServers() {
  for (const [serverName, config] of Object.entries(
    mcpConfig.mcpServers || {}
  )) {
    const port = DEFAULT_PORTS[serverName] || 3000;
    console.log(`\nChecking server: ${serverName} (expected on port ${port})`);

    // Check if port is in use
    const portInUse = await isPortInUse(port);
    if (portInUse) {
      console.log(`✅ Port ${port} is in use`);

      // Try SSE endpoint
      const sseWorks = await testSSE(port);
      if (sseWorks) {
        console.log(`✅ SSE endpoint working on port ${port}`);
      } else {
        console.log(`❌ SSE endpoint not responding on port ${port}`);
      }
    } else {
      console.log(`❌ Port ${port} is not in use`);
      console.log(`   Consider starting the server with:`);
      console.log(`   ${config.command} ${config.args.join(" ")}`);
    }
  }
}

checkServers()
  .then(() => console.log("\n✅ Server testing complete!"))
  .catch((err) => console.error("Error testing servers:", err));
