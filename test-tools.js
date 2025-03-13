const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const homedir = require("os").homedir();

// Load the MCP configuration
const mcpConfigPath = path.join(homedir, ".cursor", "mcp.json");
const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));

console.log("🛠️ Testing MCP Tools...");
console.log("=====================");

// Default port mapping
const SERVER_PORTS = {
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

// Test data for each tool
const TEST_DATA = {
  summarize_text: {
    text: "This is a test paragraph that should be summarized. It contains multiple sentences with various information. The goal is to see if the summarization tool works correctly with this input.",
    template: "default",
    max_length: 50,
  },
  docker_exec: {
    container: "test-container",
    command: 'echo "Hello from container"',
    timeout: 5000,
  },
  search_memory: {
    query: "test query",
    limit: 5,
  },
  create_entity: {
    name: "TestEntity",
    type: "test",
    observations: ["This is a test entity"],
  },
  search_entities: {
    query: "Test",
    limit: 5,
  },
  pack_repository: {
    repoUrl: "https://github.com/example/example",
    format: "json",
  },
};

// Function to test a tool
async function testTool(toolName, toolConfig) {
  console.log(`\nTesting tool: ${toolName}`);

  const serverName = toolConfig.server;
  if (!serverName) {
    console.log(`❌ No server specified for tool ${toolName}`);
    return;
  }

  const port = SERVER_PORTS[serverName];
  if (!port) {
    console.log(`❌ Unknown port for server ${serverName}`);
    return;
  }

  const testData = TEST_DATA[toolName];
  if (!testData) {
    console.log(`❓ No test data available for ${toolName}`);
    return;
  }

  try {
    // Make a POST request to the tool endpoint
    const response = await fetch(
      `http://localhost:${port}/api/tools/${toolName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
        timeout: 5000,
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Tool ${toolName} responded successfully`);
      console.log(`   Result: ${JSON.stringify(result).substring(0, 100)}...`);
    } else {
      console.log(`❌ Tool ${toolName} failed with status ${response.status}`);
      const text = await response.text();
      console.log(`   Error: ${text.substring(0, 100)}`);
    }
  } catch (error) {
    console.log(`❌ Error testing tool ${toolName}: ${error.message}`);
  }
}

// Run tests for all tools
async function testAllTools() {
  for (const [toolName, toolConfig] of Object.entries(mcpConfig.tools || {})) {
    await testTool(toolName, toolConfig);
  }
}

testAllTools()
  .then(() => console.log("\n✅ Tool testing complete!"))
  .catch((err) => console.error("Error testing tools:", err));
