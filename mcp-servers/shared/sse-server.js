"use strict";
/**
 * mcp-servers/shared/sse-server.ts
 *
 * Base Server-Sent Events (SSE) server implementation for MCP.
 * This provides core functionality that all MCP servers will extend.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSEServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const events_1 = require("events");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
/**
 * Base SSE Server class for MCP implementations
 */
class SSEServer {
    constructor(config) {
        this.app = (0, express_1.default)();
        this.name = config.name;
        this.port = config.port;
        this.baseRoute = config.baseRoute || '/api';
        this.verbose = config.verbose || false;
        this.connections = new Map();
        this.eventEmitter = new events_1.EventEmitter();
        this.initializeMiddleware();
        this.initializeSSEEndpoint();
        this.handleErrors();
    }
    /**
     * Initialize Express middleware
     */
    initializeMiddleware() {
        // Apply standard middleware
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Security and logging middleware
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: false // Allow SSE connections
        }));
        if (this.verbose) {
            this.app.use((0, morgan_1.default)('dev'));
        }
    }
    /**
     * Initialize SSE endpoint for MCP
     */
    initializeSSEEndpoint() {
        this.app.get('/sse', (req, res) => {
            const clientId = req.query.clientId || `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Set SSE headers
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no' // Disable nginx buffering
            });
            // Send initial connection message
            res.write(`event: connected\n`);
            res.write(`data: {"id":"${clientId}"}\n\n`);
            // Store client connection
            const connection = { id: clientId, response: res };
            this.connections.set(clientId, connection);
            if (this.verbose) {
                console.log(`[${this.name}] Client connected: ${clientId}`);
            }
            // Handle client disconnect
            req.on('close', () => {
                this.connections.delete(clientId);
                if (this.verbose) {
                    console.log(`[${this.name}] Client disconnected: ${clientId}`);
                }
            });
            // Send keepalive every 30 seconds
            const keepaliveInterval = setInterval(() => {
                if (this.connections.has(clientId)) {
                    res.write(`event: ping\n`);
                    res.write(`data: {}\n\n`);
                }
                else {
                    clearInterval(keepaliveInterval);
                }
            }, 30000);
        });
    }
    /**
     * Send event to specific client
     */
    sendEvent(clientId, event, data) {
        const connection = this.connections.get(clientId);
        if (connection) {
            try {
                connection.response.write(`event: ${event}\n`);
                connection.response.write(`data: ${JSON.stringify(data)}\n\n`);
                return true;
            }
            catch (error) {
                console.error(`[${this.name}] Error sending event to client ${clientId}:`, error);
                this.connections.delete(clientId);
                return false;
            }
        }
        return false;
    }
    /**
     * Broadcast event to all connected clients
     */
    broadcastEvent(event, data) {
        this.connections.forEach((connection) => {
            this.sendEvent(connection.id, event, data);
        });
    }
    /**
     * Handle global errors
     */
    handleErrors() {
        this.app.use((err, req, res, next) => {
            console.error(`[${this.name}] Error:`, err);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: this.verbose ? err.message : undefined
            });
        });
    }
    /**
     * Start the server
     */
    start() {
        this.app.listen(this.port, () => {
            console.log(`[${this.name}] MCP Server running on port ${this.port}`);
        });
    }
}
exports.SSEServer = SSEServer;
//# sourceMappingURL=sse-server.js.map