import * as WebSocket from 'ws';
import * as http from 'http';
import { EventEmitter } from 'events';
import { KnowledgeGraphManager } from '../knowledge-graph/KnowledgeGraphManager';
import { DevelopmentModeManager } from '../modes/DevelopmentModeManager';

// Tool call types
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  timestamp: number;
}

export interface ToolResponse {
  id: string;
  result: any;
  error?: string;
  executionTime?: number;
}

export interface ToolImplementation {
  execute: (args: Record<string, any>) => Promise<any>;
  schema: ToolSchema;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required?: string[];
}

// Tracking service for call optimization
export class CallTrackingService {
  private calls: Map<string, ToolCall[]> = new Map();
  
  public recordCall(call: ToolCall): void {
    const existingCalls = this.calls.get(call.name) || [];
    existingCalls.push(call);
    this.calls.set(call.name, existingCalls);
  }
  
  public getCallStats(): Record<string, { count: number, avgExecutionTime: number }> {
    const stats: Record<string, { count: number, avgExecutionTime: number }> = {};
    
    for (const [name, calls] of this.calls.entries()) {
      stats[name] = {
        count: calls.length,
        avgExecutionTime: 0 // This would be calculated if we had execution times
      };
    }
    
    return stats;
  }
  
  public getRecentCalls(toolName: string, limit: number = 10): ToolCall[] {
    const calls = this.calls.get(toolName) || [];
    return [...calls].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
}

export class LocalMCPServer extends EventEmitter {
  private server: http.Server;
  private wss: WebSocket.Server;
  private tools: Map<string, ToolImplementation> = new Map();
  private callTracker: CallTrackingService = new CallTrackingService();
  private connections: Map<string, WebSocket> = new Map();
  private knowledgeGraphManager?: KnowledgeGraphManager;
  private developmentModeManager?: DevelopmentModeManager;
  
  constructor(
    port: number = 3000,
    private toolTimeoutMs: number = 10000
  ) {
    super();
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
  public setKnowledgeGraphManager(manager: KnowledgeGraphManager): void {
    this.knowledgeGraphManager = manager;
  }
  
  /**
   * Set the development mode manager for integration
   */
  public setDevelopmentModeManager(manager: DevelopmentModeManager): void {
    this.developmentModeManager = manager;
  }
  
  /**
   * Register a tool with the server
   */
  public registerTool(tool: ToolImplementation): void {
    this.tools.set(tool.schema.name, tool);
    console.log(`Registered tool: ${tool.schema.name}`);
  }
  
  /**
   * Handle HTTP requests (for health checks and status)
   */
  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
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
  private setupWebSocketHandlers(): void {
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
        } catch (err) {
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
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Handle a tool call
   */
  async handleToolCall(call: ToolCall): Promise<ToolResponse> {
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
    } catch (error) {
      return this.createErrorResponse(error as Error, call);
    }
  }
  
  /**
   * Execute a tool call with timeout
   */
  private async executeWithTimeout(call: ToolCall): Promise<ToolResponse> {
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
      const timeoutPromise = new Promise<never>((_, reject) => {
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
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Emit event for monitoring
      this.emit('tool_error', {
        call,
        executionTime,
        error
      });
      
      return this.createErrorResponse(error as Error, call, executionTime);
    }
  }
  
  /**
   * Create an error response
   */
  private createErrorResponse(error: Error, call: ToolCall, executionTime?: number): ToolResponse {
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
  private async batchCompatibleCalls(calls: ToolCall[]): Promise<ToolResponse[]> {
    const toolGroups = new Map<string, ToolCall[]>();
    
    // Group calls by tool name
    for (const call of calls) {
      const group = toolGroups.get(call.name) || [];
      group.push(call);
      toolGroups.set(call.name, group);
    }
    
    const responses: ToolResponse[] = [];
    
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
  public broadcast(message: any): void {
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
  public stop(): Promise<void> {
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