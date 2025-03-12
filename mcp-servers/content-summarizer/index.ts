/**
 * mcp-servers/content-summarizer/index.ts
 *
 * Entry point for the Content Summarizer MCP server.
 * Exports the ContentSummarizerServer class and provides
 * default configuration for usage.
 */

import { ContentSummarizerServer } from "./content-summarizer-server";

// Export the server class
export { ContentSummarizerServer };

// Default server instance factory
export function createContentSummarizerServer(config?: any) {
  return new ContentSummarizerServer(config);
}

// If this file is run directly, start the server
if (require.main === module) {
  const server = createContentSummarizerServer();
  server.start();
  console.log(`Content Summarizer MCP server started`);

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("Shutting down Content Summarizer MCP server...");
    server.shutdown();
    process.exit(0);
  });
}
