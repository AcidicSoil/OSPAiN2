import * as path from 'path';
import { LocalMCPServer } from './local-server';
import { KnowledgeGraphTool } from './tools/knowledge-graph-tool';
import { KnowledgeGraphManager } from '../knowledge-graph/KnowledgeGraphManager';
import { DevelopmentModeManager } from '../modes/DevelopmentModeManager';
import * as vscode from 'vscode';

/**
 * Initializes and starts the MCP server
 */
export async function startMCPServer(
  context: vscode.ExtensionContext,
  port: number = 3000
): Promise<LocalMCPServer> {
  console.log('Starting MCP server on port', port);
  
  // Create the server
  const server = new LocalMCPServer(port);
  
  // Initialize managers
  const knowledgeGraphManager = new KnowledgeGraphManager(context);
  await knowledgeGraphManager.initialize();
  
  const modeManager = new DevelopmentModeManager(context);
  
  // Connect managers to server
  server.setKnowledgeGraphManager(knowledgeGraphManager);
  server.setDevelopmentModeManager(modeManager);
  
  // Register tools
  const knowledgeGraphTool = new KnowledgeGraphTool(knowledgeGraphManager);
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
export function createMCPConfig(port: number = 3000): any {
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
export async function writeMCPConfig(
  context: vscode.ExtensionContext,
  port: number = 3000
): Promise<void> {
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
  } catch (error) {
    // Directory might already exist
  }
  
  // Write MCP config
  const configPath = path.join(cursorDir, 'mcp.json');
  await fs.writeFile(
    vscode.Uri.file(configPath),
    Buffer.from(JSON.stringify(config, null, 2))
  );
  
  console.log(`MCP configuration written to ${configPath}`);
} 