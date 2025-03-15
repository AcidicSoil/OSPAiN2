"use strict";
/**
 * mcp-servers/shared/mcp-types.ts
 *
 * Type definitions for the Model Context Protocol (MCP).
 * These types define the structure of requests and responses for MCP servers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPEventType = void 0;
// SSE Event Types
var MCPEventType;
(function (MCPEventType) {
    MCPEventType["CONNECTED"] = "connected";
    MCPEventType["INFO"] = "info";
    MCPEventType["TOOL_REQUEST"] = "tool_request";
    MCPEventType["TOOL_RESPONSE"] = "tool_response";
    MCPEventType["RESOURCE_REQUEST"] = "resource_request";
    MCPEventType["RESOURCE_RESPONSE"] = "resource_response";
    MCPEventType["PROMPT_REQUEST"] = "prompt_request";
    MCPEventType["PROMPT_RESPONSE"] = "prompt_response";
    MCPEventType["ERROR"] = "error";
    MCPEventType["PING"] = "ping";
})(MCPEventType || (exports.MCPEventType = MCPEventType = {}));
//# sourceMappingURL=mcp-types.js.map