"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalMCPServer = exports.CallTrackingService = void 0;
const WebSocket = __importStar(require("ws"));
const http = __importStar(require("http"));
const events_1 = require("events");
// Tracking service for call optimization
class CallTrackingService {
    constructor() {
        this.calls = new Map();
    }
    recordCall(call) {
        const existingCalls = this.calls.get(call.name) || [];
        existingCalls.push(call);
        this.calls.set(call.name, existingCalls);
    }
    getCallStats() {
        const stats = {};
        for (const [name, calls] of this.calls.entries()) {
            stats[name] = {
                count: calls.length,
                avgExecutionTime: 0 // This would be calculated if we had execution times
            };
        }
        return stats;
    }
    getRecentCalls(toolName, limit = 10) {
        const calls = this.calls.get(toolName) || [];
        return [...calls].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }
}
exports.CallTrackingService = CallTrackingService;
class LocalMCPServer extends events_1.EventEmitter {
    constructor(port = 3000, toolTimeoutMs = 10000) {
        super();
        this.toolTimeoutMs = toolTimeoutMs;
        this.tools = new Map();
        this.callTracker = new CallTrackingService();
        this.connections = new Map();
        this.server = http.createServer(this.handleHttpRequest.bind(this));
        this.wss = new WebSocket.Server({ server: this.server });
        this.setupWebSocketHandlers();
        this.server.listen(port, () => {
            console.log(`MCP Server running on port ${port}`);
        });
    }
    /**
     * Set the knowledge graph manager for integration
     */
    setKnowledgeGraphManager(manager) {
        this.knowledgeGraphManager = manager;
    }
    /**
     * Set the development mode manager for integration
     */
    setDevelopmentModeManager(manager) {
        this.developmentModeManager = manager;
    }
    /**
     * Register a tool with the server
     */
    registerTool(tool) {
        this.tools.set(tool.schema.name, tool);
        console.log(`Registered tool: ${tool.schema.name}`);
    }
    /**
     * Handle HTTP requests (for health checks and status)
     */
    handleHttpRequest(req, res) {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
            return;
        }
        if (req.url === '/status') {
            const toolStats = this.callTracker.getCallStats();
            const connections = this.connections.size;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                uptime: process.uptime(),
                tools: Array.from(this.tools.keys()),
                toolStats,
                connections
            }));
            return;
        }
        res.writeHead(404);
        res.end('Not found');
    }
    /**
     * Set up WebSocket handlers
     */
    setupWebSocketHandlers() {
        this.wss.on('connection', (ws, req) => {
            const connectionId = this.generateConnectionId();
            this.connections.set(connectionId, ws);
            console.log(`New connection: ${connectionId}`);
            // Send available tools to client
            ws.send(JSON.stringify({
                type: 'server_info',
                tools: Array.from(this.tools.entries()).map(([_, tool]) => tool.schema)
            }));
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    if (data.type === 'tool_call') {
                        const response = await this.handleToolCall(data.call);
                        ws.send(JSON.stringify({
                            type: 'tool_response',
                            response
                        }));
                    }
                }
                catch (err) {
                    console.error('Error handling message:', err);
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Failed to parse or process message'
                    }));
                }
            });
            ws.on('close', () => {
                console.log(`Connection closed: ${connectionId}`);
                this.connections.delete(connectionId);
            });
        });
    }
    /**
     * Generate a unique connection ID
     */
    generateConnectionId() {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Handle a tool call
     */
    async handleToolCall(call) {
        // Record call for tracking
        this.callTracker.recordCall(call);
        // Emit event for monitoring
        this.emit('tool_call', call);
        // Enhanced error handling
        try {
            // Get current mode if available for contextual execution
            const currentMode = this.developmentModeManager?.getCurrentMode();
            if (currentMode) {
                // Add mode context to call arguments
                call.arguments.modeContext = {
                    mode: currentMode,
                    priorities: this.developmentModeManager?.getContentStrategy(currentMode).priorities
                };
            }
            // Tool execution with timeout management
            return await this.executeWithTimeout(call);
        }
        catch (error) {
            return this.createErrorResponse(error, call);
        }
    }
    /**
     * Execute a tool call with timeout
     */
    async executeWithTimeout(call) {
        const startTime = Date.now();
        const tool = this.tools.get(call.name);
        if (!tool) {
            return {
                id: call.id,
                result: null,
                error: `Tool not found: ${call.name}`,
                executionTime: 0
            };
        }
        // Validate required parameters
        if (tool.schema.required) {
            for (const requiredParam of tool.schema.required) {
                if (call.arguments[requiredParam] === undefined) {
                    return {
                        id: call.id,
                        result: null,
                        error: `Missing required parameter: ${requiredParam}`,
                        executionTime: Date.now() - startTime
                    };
                }
            }
        }
        try {
            // Create a promise that rejects after the timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Tool execution timed out after ${this.toolTimeoutMs}ms`)), this.toolTimeoutMs);
            });
            // Race the tool execution against the timeout
            const result = await Promise.race([
                tool.execute(call.arguments),
                timeoutPromise
            ]);
            const executionTime = Date.now() - startTime;
            // Emit event for monitoring
            this.emit('tool_success', {
                call,
                executionTime,
                result
            });
            return {
                id: call.id,
                result,
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            // Emit event for monitoring
            this.emit('tool_error', {
                call,
                executionTime,
                error
            });
            return this.createErrorResponse(error, call, executionTime);
        }
    }
    /**
     * Create an error response
     */
    createErrorResponse(error, call, executionTime) {
        return {
            id: call.id,
            result: null,
            error: error.message || 'Unknown error',
            executionTime: executionTime || 0
        };
    }
    /**
     * Batch similar tool calls where possible
     */
    async batchCompatibleCalls(calls) {
        const toolGroups = new Map();
        // Group calls by tool name
        for (const call of calls) {
            const group = toolGroups.get(call.name) || [];
            group.push(call);
            toolGroups.set(call.name, group);
        }
        const responses = [];
        // Process each group
        for (const [toolName, toolCalls] of toolGroups.entries()) {
            const tool = this.tools.get(toolName);
            if (!tool) {
                // Return error responses for unknown tools
                responses.push(...toolCalls.map(call => ({
                    id: call.id,
                    result: null,
                    error: `Tool not found: ${toolName}`
                })));
                continue;
            }
            // TODO: Implement actual batching logic based on tool capabilities
            // For now, just execute each call individually
            for (const call of toolCalls) {
                responses.push(await this.handleToolCall(call));
            }
        }
        return responses;
    }
    /**
     * Broadcast a message to all connected clients
     */
    broadcast(message) {
        const messageString = JSON.stringify(message);
        for (const [_, ws] of this.connections) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(messageString);
            }
        }
    }
    /**
     * Stop the server
     */
    stop() {
        return new Promise((resolve) => {
            // Close all WebSocket connections
            for (const [_, ws] of this.connections) {
                ws.close();
            }
            // Clear connections map
            this.connections.clear();
            // Close the server
            this.wss.close();
            this.server.close(() => {
                console.log('MCP Server stopped');
                resolve();
            });
        });
    }
}
exports.LocalMCPServer = LocalMCPServer;
//# sourceMappingURL=local-server.js.map