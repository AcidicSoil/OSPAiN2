#!/usr/bin/env node
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const local_server_1 = require("./local-server");
// Mock VS Code extension context for standalone operation
class MockExtensionContext {
    constructor() {
        this.subscriptions = [];
        this.globalState = {
            get: (key, defaultValue) => defaultValue,
            update: (key, value) => Promise.resolve(),
            keys: () => []
        };
        this.workspaceState = this.globalState;
        this.extensionPath = process.cwd();
        this.storagePath = path.join(process.cwd(), '.storage');
        this.logPath = path.join(process.cwd(), '.logs');
    }
}
// Mock Knowledge Graph Manager for standalone operation
class StandaloneKnowledgeGraphManager {
    constructor() {
        this.nodes = new Map();
        this.relationships = new Map();
    }
    async initialize() {
        console.log('Initializing standalone Knowledge Graph Manager');
    }
    async searchGraph(query) {
        console.log(`Searching for: ${query}`);
        return Array.from(this.nodes.values()).filter(node => JSON.stringify(node).toLowerCase().includes(query.toLowerCase()));
    }
    async hybridSearch(query, options) {
        console.log(`Hybrid search for: ${query} with options:`, options);
        return this.searchGraph(query);
    }
    async getRelatedNodes(nodeId) {
        console.log(`Getting related nodes for: ${nodeId}`);
        const relatedNodeIds = new Set();
        const relevantRelationships = Array.from(this.relationships.values())
            .filter(rel => rel.source === nodeId || rel.target === nodeId);
        relevantRelationships.forEach(rel => {
            if (rel.source === nodeId)
                relatedNodeIds.add(rel.target);
            if (rel.target === nodeId)
                relatedNodeIds.add(rel.source);
        });
        const relatedNodes = Array.from(relatedNodeIds)
            .map(id => this.nodes.get(id))
            .filter(Boolean);
        return {
            nodes: relatedNodes,
            relationships: relevantRelationships
        };
    }
    async addDocumentToGraph(document) {
        const content = typeof document.getText === 'function'
            ? document.getText()
            : document.content || '';
        const uri = typeof document.uri?.toString === 'function'
            ? document.uri.toString()
            : document.uri || `doc_${Date.now()}`;
        console.log(`Adding document to graph: ${uri}`);
        const nodeId = `node_${Date.now()}`;
        this.nodes.set(nodeId, {
            id: nodeId,
            label: path.basename(uri),
            type: 'document',
            properties: {
                uri,
                content,
                added: new Date().toISOString()
            }
        });
        return Promise.resolve();
    }
    getContext() {
        return new MockExtensionContext();
    }
}
// Mock Development Mode Manager for standalone operation
class StandaloneDevelopmentModeManager {
    constructor() {
        this.currentMode = 'engineering';
    }
    getCurrentMode() {
        return this.currentMode;
    }
    getContentStrategy(mode) {
        const strategies = {
            design: {
                priorities: {
                    fileTypes: { 'tsx': 0.8, 'css': 0.9 },
                    directoryTypes: { 'components': 0.9 }
                }
            },
            engineering: {
                priorities: {
                    fileTypes: { 'ts': 0.9, 'js': 0.9 },
                    directoryTypes: { 'src': 0.9 }
                }
            },
            testing: {
                priorities: {
                    fileTypes: { 'test.ts': 0.95 },
                    directoryTypes: { 'tests': 0.95 }
                }
            },
            deployment: {
                priorities: {
                    fileTypes: { 'yml': 0.9 },
                    directoryTypes: { 'deploy': 0.95 }
                }
            },
            maintenance: {
                priorities: {
                    fileTypes: { 'log': 0.9 },
                    directoryTypes: { 'docs': 0.9 }
                }
            }
        };
        return strategies[mode] || strategies.engineering;
    }
}
/**
 * Load a tool implementation from a file
 */
function loadTool(toolPath) {
    try {
        // Try to load the tool dynamically
        const toolModule = require(toolPath);
        const ToolClass = toolModule.default || Object.values(toolModule)[0];
        if (typeof ToolClass === 'function') {
            return new ToolClass();
        }
        throw new Error(`Unable to find a valid tool class in ${toolPath}`);
    }
    catch (error) {
        console.error(`Failed to load tool from ${toolPath}:`, error);
        throw error;
    }
}
/**
 * Create MCP Server configuration
 */
function createMCPConfig(port, server) {
    const tools = Array.from(server.getTools()).map(([name, tool]) => ({
        name,
        description: tool.schema.description
    }));
    const config = {
        version: 1,
        servers: [
            {
                name: 'mcp-standalone',
                description: 'Standalone MCP server for enhanced functionality',
                url: `ws://localhost:${port}`,
                events: ['tool_call', 'tool_response', 'error'],
                tools
            }
        ]
    };
    return config;
}
/**
 * Write MCP configuration to the appropriate location for Cursor
 */
function writeMCPConfig(port, server) {
    const config = createMCPConfig(port, server);
    // Create .cursor directory if it doesn't exist
    const cursorDir = path.join(process.cwd(), '.cursor');
    if (!fs.existsSync(cursorDir)) {
        fs.mkdirSync(cursorDir, { recursive: true });
    }
    // Write MCP config
    const configPath = path.join(cursorDir, 'mcp.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`MCP configuration written to ${configPath}`);
}
/**
 * Start the MCP server standalone
 */
async function startStandaloneServer(options) {
    const { port, toolsDir, writeMCPConfig: shouldWriteConfig } = options;
    console.log(`Starting standalone MCP server on port ${port}`);
    // Create the server
    const server = new local_server_1.LocalMCPServer(port);
    // Add getTools method for the CLI script
    server.getTools = function () {
        return this.tools;
    };
    // Initialize managers
    const knowledgeGraphManager = new StandaloneKnowledgeGraphManager();
    await knowledgeGraphManager.initialize();
    const modeManager = new StandaloneDevelopmentModeManager();
    // Connect managers to server
    server.setKnowledgeGraphManager(knowledgeGraphManager);
    server.setDevelopmentModeManager(modeManager);
    // Register built-in tool for the Knowledge Graph
    const knowledgeGraphTool = {
        schema: {
            name: 'knowledgeGraph',
            description: 'Tool for interacting with the Knowledge Graph',
            parameters: {
                properties: {
                    operation: {
                        type: 'string',
                        description: 'The operation to perform: search, hybridSearch, getRelatedNodes, addContent',
                        enum: ['search', 'hybridSearch', 'getRelatedNodes', 'addContent']
                    },
                    query: {
                        type: 'string',
                        description: 'The search query (required for search/hybridSearch operations)'
                    },
                    nodeId: {
                        type: 'string',
                        description: 'Node ID for getRelatedNodes operation'
                    },
                    content: {
                        type: 'string',
                        description: 'Content to add to the knowledge graph (for addContent operation)'
                    },
                    metadata: {
                        type: 'object',
                        description: 'Metadata for the content (for addContent operation)'
                    },
                    options: {
                        type: 'object',
                        description: 'Search options for customizing the search behavior'
                    }
                },
                required: ['operation']
            },
            required: ['operation']
        },
        execute: async (args) => {
            const { operation } = args;
            switch (operation) {
                case 'search':
                    return knowledgeGraphManager.searchGraph(args.query);
                case 'hybridSearch':
                    return knowledgeGraphManager.hybridSearch(args.query, args.options);
                case 'getRelatedNodes':
                    return knowledgeGraphManager.getRelatedNodes(args.nodeId);
                case 'addContent':
                    await knowledgeGraphManager.addDocumentToGraph({
                        content: args.content,
                        uri: args.metadata?.uri || `doc_${Date.now()}`
                    });
                    return { success: true };
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }
        }
    };
    server.registerTool(knowledgeGraphTool);
    // Load additional tools from toolsDir if specified
    if (toolsDir && fs.existsSync(toolsDir)) {
        const toolFiles = fs.readdirSync(toolsDir)
            .filter(file => file.endsWith('.js') || file.endsWith('.ts'));
        for (const toolFile of toolFiles) {
            try {
                const toolPath = path.join(toolsDir, toolFile);
                const tool = loadTool(toolPath);
                server.registerTool(tool);
                console.log(`Registered tool from ${toolFile}: ${tool.schema.name}`);
            }
            catch (error) {
                console.error(`Failed to register tool from ${toolFile}:`, error);
            }
        }
    }
    // Set up event handlers
    server.on('tool_call', (call) => {
        console.log(`Tool called: ${call.name}`);
    });
    server.on('tool_error', (error) => {
        console.error('Tool execution error:', error);
    });
    console.log('MCP server started successfully');
    // Write MCP config if requested
    if (shouldWriteConfig) {
        writeMCPConfig(port, server);
    }
    return server;
}
// Process command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    let port = 3000;
    let toolsDir;
    let writeMCPConfig = true;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--port' && i + 1 < args.length) {
            port = parseInt(args[i + 1], 10);
            i++;
        }
        else if (args[i] === '--tools-dir' && i + 1 < args.length) {
            toolsDir = args[i + 1];
            i++;
        }
        else if (args[i] === '--no-mcp-config') {
            writeMCPConfig = false;
        }
        else if (args[i] === '--help') {
            console.log(`
MCP Server CLI

Usage:
  node cli.js [options]

Options:
  --port <port>       Port to run the server on (default: 3000)
  --tools-dir <dir>   Directory to load additional tools from
  --no-mcp-config     Don't write mcp.json config for Cursor
  --help              Show this help message
`);
            process.exit(0);
        }
    }
    return { port, toolsDir, writeMCPConfig };
}
// Run the server if this file is executed directly
if (require.main === module) {
    const options = parseArgs();
    startStandaloneServer(options).catch(error => {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map