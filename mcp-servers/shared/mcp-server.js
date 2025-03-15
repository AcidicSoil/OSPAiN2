"use strict";
/**
 * mcp-servers/shared/mcp-server.ts
 *
 * Base MCP Server implementation that extends the SSE server.
 * Provides common functionality for handling MCP requests and responses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = void 0;
const sse_server_1 = require("./sse-server");
const mcp_types_1 = require("./mcp-types");
const security_1 = require("./security");
/**
 * Base MCP Server class
 */
class MCPServer extends sse_server_1.SSEServer {
    constructor(config) {
        super(config);
        this.version = config.version;
        this.description = config.description;
        this.tools = new Map();
        this.resources = new Map();
        this.prompts = new Map();
        this.securityOptions = config.security;
        // Apply security middleware if configured
        this.applySecurity();
        // Register MCP-specific routes
        this.initializeMCPEndpoints();
    }
    /**
     * Apply security middleware if configured
     */
    applySecurity() {
        if (this.securityOptions) {
            const security = (0, security_1.securityMiddleware)(this.securityOptions);
            // Apply security middleware to all routes
            security.forEach((middleware) => {
                this.app.use(middleware);
            });
            if (this.verbose) {
                console.log(`[${this.name}] Applied security middleware`);
                if (this.securityOptions.rateLimit) {
                    console.log(`[${this.name}] Rate limiting enabled: ${this.securityOptions.rateLimit.maxRequests} requests per ${this.securityOptions.rateLimit.windowMs}ms`);
                }
                if (this.securityOptions.ipRestriction) {
                    const allowedCount = this.securityOptions.ipRestriction.allowedIPs?.length || 0;
                    const blockedCount = this.securityOptions.ipRestriction.blockedIPs?.length || 0;
                    console.log(`[${this.name}] IP restrictions enabled: ${allowedCount} allowed, ${blockedCount} blocked`);
                }
                if (this.securityOptions.audit) {
                    console.log(`[${this.name}] Audit logging enabled: ${this.securityOptions.audit.logDirectory}/${this.securityOptions.audit.logFilename || "audit.log"}`);
                }
            }
        }
    }
    /**
     * Initialize MCP-specific endpoints
     */
    initializeMCPEndpoints() {
        // Register MCP info endpoint
        this.app.get(`${this.baseRoute}/info`, this.getServerInfo.bind(this));
        // Register tool execution endpoint
        this.app.post(`${this.baseRoute}/tools/:toolName`, this.handleToolRequest.bind(this));
        // Register resource endpoint
        this.app.get(`${this.baseRoute}/resources/:resourceName`, this.handleResourceRequest.bind(this));
        // Register prompt endpoint
        this.app.post(`${this.baseRoute}/prompts/:promptName`, this.handlePromptRequest.bind(this));
        // Enhanced SSE endpoint to handle MCP events
        this.app.post("/sse/events", this.handleSSEEvents.bind(this));
    }
    /**
     * Get server information
     */
    getServerInfo(req, res) {
        const serverInfo = {
            name: this.name,
            version: this.version,
            description: this.description,
            tools: Array.from(this.tools.values()),
            resources: Array.from(this.resources.values()),
            prompts: Array.from(this.prompts.values()),
        };
        res.json(serverInfo);
    }
    /**
     * Register a tool
     */
    registerTool(tool) {
        this.tools.set(tool.name, tool);
        if (this.verbose) {
            console.log(`[${this.name}] Registered tool: ${tool.name}`);
        }
    }
    /**
     * Register a resource
     */
    registerResource(resource) {
        this.resources.set(resource.name, resource);
        if (this.verbose) {
            console.log(`[${this.name}] Registered resource: ${resource.name}`);
        }
    }
    /**
     * Register a prompt
     */
    registerPrompt(prompt) {
        this.prompts.set(prompt.name, prompt);
        if (this.verbose) {
            console.log(`[${this.name}] Registered prompt: ${prompt.name}`);
        }
    }
    /**
     * Handle tool execution request
     */
    async handleToolRequest(req, res, next) {
        const toolName = req.params.toolName;
        const tool = this.tools.get(toolName);
        if (!tool) {
            res.status(404).json({
                success: false,
                error: `Tool '${toolName}' not found`,
            });
            return;
        }
        try {
            const requestId = req.body.id || `req-${Date.now()}`;
            const parameters = req.body.parameters || {};
            // Create tool request
            const toolRequest = {
                id: requestId,
                tool: toolName,
                parameters,
            };
            // Execute tool
            const response = await this.executeTool(toolRequest);
            // Send response
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handle resource request
     */
    async handleResourceRequest(req, res, next) {
        const resourceName = req.params.resourceName;
        const resource = this.resources.get(resourceName);
        if (!resource) {
            res.status(404).json({
                success: false,
                error: `Resource '${resourceName}' not found`,
            });
            return;
        }
        try {
            const requestId = req.query.id || `req-${Date.now()}`;
            const parameters = req.query;
            // Create resource request
            const resourceRequest = {
                id: requestId,
                resource: resourceName,
                parameters,
            };
            // Get resource
            const response = await this.getResource(resourceRequest);
            // Send response
            if (response.contentType) {
                res.setHeader("Content-Type", response.contentType);
            }
            if (response.success && response.data) {
                res.send(response.data);
            }
            else {
                res.status(400).json(response);
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handle prompt request
     */
    async handlePromptRequest(req, res, next) {
        const promptName = req.params.promptName;
        const prompt = this.prompts.get(promptName);
        if (!prompt) {
            res.status(404).json({
                success: false,
                error: `Prompt '${promptName}' not found`,
            });
            return;
        }
        try {
            const requestId = req.body.id || `req-${Date.now()}`;
            const parameters = req.body.parameters || {};
            // Create prompt request
            const promptRequest = {
                id: requestId,
                prompt: promptName,
                parameters,
            };
            // Execute prompt
            const response = await this.executePrompt(promptRequest);
            // Send response
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handle SSE events
     */
    async handleSSEEvents(req, res, next) {
        try {
            const { clientId, event, data } = req.body;
            if (!clientId || !this.connections.has(clientId)) {
                res.status(400).json({
                    success: false,
                    error: "Invalid or inactive client ID",
                });
                return;
            }
            // Handle incoming event
            switch (event) {
                case mcp_types_1.MCPEventType.TOOL_REQUEST:
                    this.handleToolRequestEvent(clientId, data);
                    break;
                case mcp_types_1.MCPEventType.RESOURCE_REQUEST:
                    this.handleResourceRequestEvent(clientId, data);
                    break;
                case mcp_types_1.MCPEventType.PROMPT_REQUEST:
                    this.handlePromptRequestEvent(clientId, data);
                    break;
                default:
                    // Simply acknowledge unknown events
                    break;
            }
            res.json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handle tool request via SSE
     */
    async handleToolRequestEvent(clientId, data) {
        try {
            const response = await this.executeTool(data);
            this.sendEvent(clientId, mcp_types_1.MCPEventType.TOOL_RESPONSE, response);
        }
        catch (error) {
            this.sendEvent(clientId, mcp_types_1.MCPEventType.ERROR, {
                id: data.id,
                error: error.message || "Unknown error",
                tool: data.tool,
            });
        }
    }
    /**
     * Handle resource request via SSE
     */
    async handleResourceRequestEvent(clientId, data) {
        try {
            const response = await this.getResource(data);
            this.sendEvent(clientId, mcp_types_1.MCPEventType.RESOURCE_RESPONSE, response);
        }
        catch (error) {
            this.sendEvent(clientId, mcp_types_1.MCPEventType.ERROR, {
                id: data.id,
                error: error.message || "Unknown error",
                resource: data.resource,
            });
        }
    }
    /**
     * Handle prompt request via SSE
     */
    async handlePromptRequestEvent(clientId, data) {
        try {
            const response = await this.executePrompt(data);
            this.sendEvent(clientId, mcp_types_1.MCPEventType.PROMPT_RESPONSE, response);
        }
        catch (error) {
            this.sendEvent(clientId, mcp_types_1.MCPEventType.ERROR, {
                id: data.id,
                error: error.message || "Unknown error",
                prompt: data.prompt,
            });
        }
    }
    /**
     * Stop the server and clean up resources
     */
    stop() {
        if (this.verbose) {
            console.log(`[${this.name}] Stopping server...`);
        }
        // Close all SSE connections
        this.connections.forEach((res, clientId) => {
            try {
                res.end();
                if (this.verbose) {
                    console.log(`[${this.name}] Closed connection for client: ${clientId}`);
                }
            }
            catch (error) {
                console.error(`[${this.name}] Error closing connection for client ${clientId}:`, error);
            }
        });
        // Clear connections map
        this.connections.clear();
        // Close the server if it's running
        if (this.server && this.server.listening) {
            this.server.close(() => {
                if (this.verbose) {
                    console.log(`[${this.name}] Server stopped`);
                }
            });
        }
    }
}
exports.MCPServer = MCPServer;
//# sourceMappingURL=mcp-server.js.map