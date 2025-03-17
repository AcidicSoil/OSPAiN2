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
exports.startMCPServer = startMCPServer;
exports.createMCPConfig = createMCPConfig;
exports.writeMCPConfig = writeMCPConfig;
const path = __importStar(require("path"));
const local_server_1 = require("./local-server");
const knowledge_graph_tool_1 = require("./tools/knowledge-graph-tool");
const KnowledgeGraphManager_1 = require("../knowledge-graph/KnowledgeGraphManager");
const DevelopmentModeManager_1 = require("../modes/DevelopmentModeManager");
const vscode = __importStar(require("vscode"));
/**
 * Initializes and starts the MCP server
 */
async function startMCPServer(context, port = 3000) {
    console.log('Starting MCP server on port', port);
    // Create the server
    const server = new local_server_1.LocalMCPServer(port);
    // Initialize managers
    const knowledgeGraphManager = new KnowledgeGraphManager_1.KnowledgeGraphManager(context);
    await knowledgeGraphManager.initialize();
    const modeManager = new DevelopmentModeManager_1.DevelopmentModeManager(context);
    // Connect managers to server
    server.setKnowledgeGraphManager(knowledgeGraphManager);
    server.setDevelopmentModeManager(modeManager);
    // Register tools
    const knowledgeGraphTool = new knowledge_graph_tool_1.KnowledgeGraphTool(knowledgeGraphManager);
    server.registerTool(knowledgeGraphTool);
    // Register additional tools here
    // ...
    // Set up event handlers
    server.on('tool_call', (call) => {
        console.log(`Tool called: ${call.name}`);
    });
    server.on('tool_error', (error) => {
        console.error('Tool execution error:', error);
    });
    // Store server reference for cleanup
    context.subscriptions.push({
        dispose: () => {
            console.log('Disposing MCP server');
            server.stop();
        }
    });
    console.log('MCP server started successfully');
    return server;
}
/**
 * Create MCP Server configuration for Cursor
 */
function createMCPConfig(port = 3000) {
    const config = {
        version: 1,
        servers: [
            {
                name: 'knowledge-graph',
                description: 'Knowledge Graph MCP server for enhanced content search and retrieval',
                url: `ws://localhost:${port}`,
                events: ['tool_call', 'tool_response', 'error'],
                tools: [
                    {
                        name: 'knowledgeGraph',
                        description: 'Tool for interacting with the Knowledge Graph'
                    }
                ]
            }
        ]
    };
    return config;
}
/**
 * Write MCP configuration to the appropriate location for Cursor
 */
async function writeMCPConfig(context, port = 3000) {
    const config = createMCPConfig(port);
    // Get workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found');
    }
    const workspaceFolder = workspaceFolders[0];
    // Create .cursor directory if it doesn't exist
    const cursorDir = path.join(workspaceFolder.uri.fsPath, '.cursor');
    const fs = vscode.workspace.fs;
    try {
        await fs.createDirectory(vscode.Uri.file(cursorDir));
    }
    catch (error) {
        // Directory might already exist
    }
    // Write MCP config
    const configPath = path.join(cursorDir, 'mcp.json');
    await fs.writeFile(vscode.Uri.file(configPath), Buffer.from(JSON.stringify(config, null, 2)));
    console.log(`MCP configuration written to ${configPath}`);
}
//# sourceMappingURL=index.js.map