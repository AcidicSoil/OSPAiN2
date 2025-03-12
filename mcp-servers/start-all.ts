/**
 * mcp-servers/start-all.ts
 *
 * Script to start all MCP servers in one command.
 * This script launches each MCP server in a separate process.
 */

import { spawn, ChildProcess } from "child_process";
import { join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Server configurations
interface ServerConfig {
  name: string;
  script: string;
  port: number;
  env?: Record<string, string>;
}

const servers: ServerConfig[] = [
  {
    name: "Prompt Engineering Assistant",
    script: join(
      __dirname,
      "prompt-engineering",
      "prompt-engineering-server.js"
    ),
    port: parseInt(process.env.PROMPT_ENGINEERING_PORT || "3001", 10),
    env: {
      OLLAMA_ENDPOINT: process.env.OLLAMA_ENDPOINT || "http://localhost:11434",
      OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3",
    },
  },
  {
    name: "Docker Integration",
    script: join(
      __dirname,
      "docker-integration",
      "docker-integration-server.js"
    ),
    port: parseInt(process.env.DOCKER_INTEGRATION_PORT || "3002", 10),
    env: {
      ALLOWED_DOCKER_COMMANDS:
        process.env.ALLOWED_DOCKER_COMMANDS || "ls,ps,exec,logs,inspect,stats",
    },
  },
  {
    name: "Mouse Automation",
    script: join(__dirname, "mouse-automation", "mouse-automation-server.js"),
    port: parseInt(process.env.MOUSE_AUTOMATION_PORT || "3003", 10),
    env: {
      SIMULATION_MODE: process.env.SIMULATION_MODE || "false",
      SECURITY_ENABLED: process.env.SECURITY_ENABLED || "true",
      CLICK_DELAY: process.env.CLICK_DELAY || "200",
      DRAG_ENABLED: process.env.DRAG_ENABLED || "true",
      ACCELERATED_MODE: process.env.ACCELERATED_MODE || "false",
      MAX_SEQUENCE_LENGTH: process.env.MAX_SEQUENCE_LENGTH || "10",
      DEBUG: process.env.DEBUG || "false",
    },
  },
  {
    name: "Knowledge Graph",
    script:
      process.env.KNOWLEDGE_GRAPH_SCRIPT ||
      join(__dirname, "../mcp-knowledge-graph/dist/index.js"),
    port: parseInt(process.env.KNOWLEDGE_GRAPH_PORT || "3004", 10),
    env: {
      MEMORY_PATH:
        process.env.KNOWLEDGE_GRAPH_MEMORY_PATH ||
        join(process.cwd(), "data/memory.jsonl"),
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
    },
  },
];

// Track running servers
const runningServers: Map<string, ChildProcess> = new Map();

/**
 * Start a server with the given configuration
 */
function startServer(config: ServerConfig): void {
  console.log(`Starting ${config.name} on port ${config.port}...`);

  // Prepare environment variables
  const env = {
    ...process.env,
    PORT: config.port.toString(),
    VERBOSE: "true",
    ...config.env,
  };

  // Start the server process
  const serverProcess = spawn("node", [config.script], {
    env,
    stdio: "pipe",
    detached: false,
  });

  // Store reference to the process
  runningServers.set(config.name, serverProcess);

  // Handle server output
  serverProcess.stdout.on("data", (data) => {
    console.log(`[${config.name}] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`[${config.name}] ERROR: ${data.toString().trim()}`);
  });

  // Handle server exit
  serverProcess.on("exit", (code, signal) => {
    console.log(
      `[${config.name}] Server exited with code ${code} (signal: ${signal})`
    );
    runningServers.delete(config.name);

    // Restart the server if it crashed
    if (code !== 0 && code !== null) {
      console.log(`[${config.name}] Restarting server in 5 seconds...`);
      setTimeout(() => startServer(config), 5000);
    }
  });

  // Handle server error
  serverProcess.on("error", (error) => {
    console.error(`[${config.name}] Failed to start server: ${error.message}`);
  });
}

/**
 * Stop all servers
 */
function stopAllServers(): void {
  console.log("Stopping all servers...");

  runningServers.forEach((process, name) => {
    console.log(`Stopping ${name}...`);

    if (process.pid) {
      process.kill("SIGTERM");
    }
  });
}

/**
 * Start all servers
 */
function startAllServers(): void {
  console.log("Starting all MCP servers...");

  servers.forEach((server) => {
    startServer(server);
  });

  console.log("All servers started. Press Ctrl+C to stop all servers.");
}

// Handle process exit
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Shutting down...");
  stopAllServers();
  setTimeout(() => process.exit(0), 1000);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Shutting down...");
  stopAllServers();
  setTimeout(() => process.exit(0), 1000);
});

// Start servers
startAllServers();
