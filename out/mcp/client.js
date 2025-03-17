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
exports.MCPClient = void 0;
const WebSocket = __importStar(require("ws"));
const events_1 = require("events");
/**
 * MCP Client for connecting to a local or remote MCP server
 */
class MCPClient extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.connected = false;
        this.pendingCalls = new Map();
        this.availableTools = [];
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.verbose = options.verbose || false;
    }
    /**
     * Connect to the MCP server
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.options.url);
                this.ws.on('open', () => {
                    this.log('Connected to MCP server');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.emit('connected');
                    resolve();
                });
                this.ws.on('message', (data) => {
                    try {
                        this.handleMessage(data.toString());
                    }
                    catch (error) {
                        this.log('Error handling message:', error);
                    }
                });
                this.ws.on('close', () => {
                    this.log('Connection closed');
                    this.connected = false;
                    this.emit('disconnected');
                    this.attemptReconnect();
                });
                this.ws.on('error', (error) => {
                    this.log('WebSocket error:', error);
                    this.emit('error', error);
                    if (!this.connected) {
                        reject(error);
                    }
                });
            }
            catch (error) {
                this.log('Failed to connect:', error);
                reject(error);
                this.attemptReconnect();
            }
        });
    }
    /**
     * Handle incoming messages from the server
     */
    handleMessage(message) {
        const data = JSON.parse(message);
        // Handle server info message with available tools
        if (data.type === 'server_info') {
            this.availableTools = data.tools || [];
            this.emit('tools_updated', this.availableTools);
            return;
        }
        // Handle tool response
        if (data.type === 'tool_response') {
            const response = data.response;
            const pendingCall = this.pendingCalls.get(response.id);
            if (pendingCall) {
                this.pendingCalls.delete(response.id);
                if (response.error) {
                    pendingCall.reject(new Error(response.error));
                }
                else {
                    pendingCall.resolve(response.result);
                }
                this.emit('tool_response', response);
            }
            return;
        }
        // Handle server broadcast messages
        if (data.type === 'broadcast') {
            this.emit('broadcast', data.message);
            return;
        }
        // Handle errors
        if (data.type === 'error') {
            this.emit('server_error', new Error(data.error));
            return;
        }
        // Unknown message type
        this.log('Unknown message type:', data.type);
    }
    /**
     * Attempt to reconnect to the server
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.log('Max reconnect attempts reached');
            this.emit('reconnect_failed');
            return;
        }
        this.reconnectAttempts++;
        this.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => {
            this.connect().catch((error) => {
                this.log('Reconnect failed:', error);
            });
        }, this.reconnectInterval);
    }
    /**
     * Call a tool on the MCP server
     */
    async callTool(name, args = {}) {
        if (!this.connected || !this.ws) {
            throw new Error('Not connected to MCP server');
        }
        // Verify the tool exists
        const toolExists = this.availableTools.some(tool => tool.name === name);
        if (!toolExists) {
            throw new Error(`Tool not available: ${name}`);
        }
        // Create a tool call
        const call = {
            id: this.generateCallId(),
            name,
            arguments: args,
            timestamp: Date.now()
        };
        // Send the call to the server
        return new Promise((resolve, reject) => {
            try {
                this.ws.send(JSON.stringify({
                    type: 'tool_call',
                    call
                }));
                // Store the pending call
                this.pendingCalls.set(call.id, {
                    resolve,
                    reject,
                    timestamp: Date.now()
                });
                // Set a timeout for the call
                setTimeout(() => {
                    if (this.pendingCalls.has(call.id)) {
                        this.pendingCalls.delete(call.id);
                        reject(new Error(`Tool call timed out: ${name}`));
                    }
                }, 30000); // 30-second timeout
                this.emit('tool_call', call);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Generate a unique call ID
     */
    generateCallId() {
        return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get available tools from the server
     */
    getAvailableTools() {
        return [...this.availableTools];
    }
    /**
     * Check if connected to the server
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Close the connection to the server
     */
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }
    /**
     * Log messages if verbose mode is enabled
     */
    log(...args) {
        if (this.verbose) {
            console.log('[MCP Client]', ...args);
        }
    }
    /**
     * Batch multiple tool calls into a single request
     * Note: This requires server-side support for batching
     */
    async batchCallTools(calls) {
        if (!this.connected || !this.ws) {
            throw new Error('Not connected to MCP server');
        }
        const toolCalls = calls.map(call => ({
            id: this.generateCallId(),
            name: call.name,
            arguments: call.args,
            timestamp: Date.now()
        }));
        // Send the batch call to the server
        return new Promise((resolve, reject) => {
            try {
                this.ws.send(JSON.stringify({
                    type: 'batch_tool_calls',
                    calls: toolCalls
                }));
                // Create a map to track which calls have responded
                const responses = {};
                let completedCalls = 0;
                // Set up listeners for each call
                for (const call of toolCalls) {
                    this.pendingCalls.set(call.id, {
                        resolve: (result) => {
                            responses[call.id] = result;
                            completedCalls++;
                            if (completedCalls === toolCalls.length) {
                                // All calls have completed, resolve with results in the correct order
                                resolve(toolCalls.map(c => responses[c.id]));
                            }
                        },
                        reject: (error) => {
                            // If any call fails, reject the entire batch
                            for (const c of toolCalls) {
                                this.pendingCalls.delete(c.id);
                            }
                            reject(error);
                        },
                        timestamp: Date.now()
                    });
                    // Set a timeout for each call
                    setTimeout(() => {
                        if (this.pendingCalls.has(call.id)) {
                            this.pendingCalls.delete(call.id);
                            reject(new Error(`Tool call timed out: ${call.name}`));
                        }
                    }, 30000); // 30-second timeout
                }
                this.emit('batch_tool_calls', toolCalls);
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.MCPClient = MCPClient;
//# sourceMappingURL=client.js.map