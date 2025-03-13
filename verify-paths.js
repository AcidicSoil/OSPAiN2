const fs = require("fs");
const path = require("path");
const homedir = require("os").homedir();

// Load the MCP configuration
const mcpConfigPath = path.join(homedir, ".cursor", "mcp.json");
const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));

console.log("🔍 Verifying MCP Server Paths...");
console.log("================================");

// Check each server path
Object.entries(mcpConfig.mcpServers || {}).forEach(
  ([serverName, serverConfig]) => {
    console.log(`\nChecking server: ${serverName}`);

    // Verify command exists
    try {
      const commandExists = require("command-exists").sync;
      if (commandExists(serverConfig.command)) {
        console.log(`✅ Command "${serverConfig.command}" exists`);
      } else {
        console.log(`❌ Command "${serverConfig.command}" not found`);
      }
    } catch (error) {
      console.log(`❓ Unable to verify command "${serverConfig.command}"`);
    }

    // Check if args contain paths that need verification
    if (serverConfig.args) {
      serverConfig.args.forEach((arg) => {
        // Only check arguments that look like paths
        if (arg.startsWith("./") || arg.startsWith("/") || arg.includes("\\")) {
          const argPath = arg.startsWith("./")
            ? path.resolve(process.cwd(), arg.substring(2))
            : arg;

          if (fs.existsSync(argPath)) {
            console.log(`✅ Path exists: ${arg}`);
          } else {
            console.log(`❌ Path does not exist: ${arg}`);
            console.log(`   Resolved to: ${argPath}`);
          }
        }
      });
    }
  }
);

console.log("\n✅ Path verification complete!");
