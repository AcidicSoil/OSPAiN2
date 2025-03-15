import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { ToolCall, ToolResponse, ToolSchema } from './local-server';

export interface MCPClientOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  verbose?: boolean;
}

/**
 * MCP Client for connecting to a local or remote MCP server
 */
export class MCPClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private connected: boolean = false;
  private pendingCalls: Map<string, { 
    resolve: (value: any) => void; 
    reject: (reason: any) => void; 
    timestamp: number;
  }> = new Map();
  private availableTools: ToolSchema[] = [];
  private verbose: boolean;
  
  constructor(private options: MCPClientOptions) {
    super();
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.verbose = options.verbose || false;
  }
  
  /**
   * Connect to the MCP server
   */
  public async connect(): Promise<void> {
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
          } catch (error) {
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
      } catch (error) {
        this.log('Failed to connect:', error);
        reject(error);
        this.attemptReconnect();
      }
    });
  }
  
  /**
   * Handle incoming messages from the server
   */
  private handleMessage(message: string): void {
    const data = JSON.parse(message);
    
    // Handle server info message with available tools
    if (data.type === 'server_info') {
      this.availableTools = data.tools || [];
      this.emit('tools_updated', this.availableTools);
      return;
    }
    
    // Handle tool response
    if (data.type === 'tool_response') {
      const response = data.response as ToolResponse;
      const pendingCall = this.pendingCalls.get(response.id);
      
      if (pendingCall) {
        this.pendingCalls.delete(response.id);
        
        if (response.error) {
          pendingCall.reject(new Error(response.error));
        } else {
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
  private attemptReconnect(): void {
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
  public async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected to MCP server');
    }
    
    // Verify the tool exists
    const toolExists = this.availableTools.some(tool => tool.name === name);
    if (!toolExists) {
      throw new Error(`Tool not available: ${name}`);
    }
    
    // Create a tool call
    const call: ToolCall = {
      id: this.generateCallId(),
      name,
      arguments: args,
      timestamp: Date.now()
    };
    
    // Send the call to the server
    return new Promise((resolve, reject) => {
      try {
        this.ws!.send(JSON.stringify({
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
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Generate a unique call ID
   */
  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get available tools from the server
   */
  public getAvailableTools(): ToolSchema[] {
    return [...this.availableTools];
  }
  
  /**
   * Check if connected to the server
   */
  public isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Close the connection to the server
   */
  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connected = false;
  }
  
  /**
   * Log messages if verbose mode is enabled
   */
  private log(...args: any[]): void {
    if (this.verbose) {
      console.log('[MCP Client]', ...args);
    }
  }
  
  /**
   * Batch multiple tool calls into a single request
   * Note: This requires server-side support for batching
   */
  public async batchCallTools(calls: Array<{ name: string; args: Record<string, any> }>): Promise<any[]> {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected to MCP server');
    }
    
    const toolCalls: ToolCall[] = calls.map(call => ({
      id: this.generateCallId(),
      name: call.name,
      arguments: call.args,
      timestamp: Date.now()
    }));
    
    // Send the batch call to the server
    return new Promise((resolve, reject) => {
      try {
        this.ws!.send(JSON.stringify({
          type: 'batch_tool_calls',
          calls: toolCalls
        }));
        
        // Create a map to track which calls have responded
        const responses: Record<string, any> = {};
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
      } catch (error) {
        reject(error);
      }
    });
  }
} 