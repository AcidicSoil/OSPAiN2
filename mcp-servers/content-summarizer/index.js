"use strict";
/**
 * mcp-servers/content-summarizer/index.ts
 *
 * Entry point for the Content Summarizer MCP server.
 * Exports the ContentSummarizerServer class and provides
 * default configuration for usage.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentSummarizerServer = void 0;
exports.createContentSummarizerServer = createContentSummarizerServer;
const content_summarizer_server_1 = require("./content-summarizer-server");
Object.defineProperty(exports, "ContentSummarizerServer", { enumerable: true, get: function () { return content_summarizer_server_1.ContentSummarizerServer; } });
// Default server instance factory
function createContentSummarizerServer(config) {
    return new content_summarizer_server_1.ContentSummarizerServer(config);
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
//# sourceMappingURL=index.js.map